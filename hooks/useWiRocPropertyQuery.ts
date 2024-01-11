import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';
import {
  GettablePropName,
  getters,
  GetterValueOf,
  SettableValues,
  setters,
} from '../api/transformers';
import {useStore} from '../store';

type GetterName = keyof typeof getters;
type SetterName = keyof typeof setters;

/**
 * Wrapper around react-query's useQuery hook,
 * for fetching a WiRoc property value.
 */
export const useWiRocPropertyQuery = <PropName extends GetterName>(
  /**
   * The id of the device to fetch the property from.
   */
  deviceId: string,

  /**
   * The name of the property to fetch.
   */
  propertyName: PropName,

  /**
   * Options to pass through to react-query's useQuery hook.
   */
  options: Omit<
    Parameters<typeof useQuery<unknown, unknown, GetterValueOf<PropName>>>[0],
    'queryKey'
  > = {},
) => {
  const apiBackend = useStore(
    state => state.wiRocDevices[deviceId]?.apiBackend,
  );

  const query = useQuery<unknown, unknown, GetterValueOf<PropName>>({
    queryKey: getKey(deviceId, propertyName),
    queryFn: async () => {
      // Request value for property from BLE/REST etc:
      const value = await apiBackend.getProperty(propertyName);

      // API will always return string. Deserialize it to a nice type:
      const deserializedValue = getters[propertyName].deserialize(value);

      // Return the deserialized value to the hook user.
      // It will also be put in the react-query cache.
      return deserializedValue as GetterValueOf<PropName>;
    },
    staleTime: Infinity,
    ...options,
  });
  return {
    ...query,
    propertyName,
  };
};

export const useWiRocPropertiesMutation = (deviceId: string) => {
  const apiBackend = useStore(
    state => state.wiRocDevices[deviceId]?.apiBackend,
  );

  const updateQueryData = useUpdateQueryDataForDevice();
  return useMutation({
    mutationFn: async (data: Partial<SettableValues>) => {
      for (const [_propertyName, requestValue] of Object.entries(data)) {
        const propertyName = _propertyName as SetterName;
        const setter = setters[propertyName];
        if (!setter) {
          console.warn(
            '[REQ][useWiRocPropertiesMutation] No setter for property',
            propertyName,
            requestValue,
          );
          throw new Error('No setter for property ' + propertyName);
        }
        console.log('[REQ] Setting', propertyName, requestValue);
        const response = await apiBackend.setProperty(
          propertyName,
          setter.serialize(requestValue as never), // ?? :'-(
        );
        console.log('[REQ] Serialized response:', response);

        const responseValue = setter.deserializeResponse(response);

        console.log('[REQ] Deserialized response:', responseValue);

        updateQueryData(
          deviceId,
          setter.responseTarget ?? (propertyName as GettablePropName),
          responseValue,
        );
      }
    },
  });
};

export const useWiRocPropertyMutation = <
  PropName extends SetterName,
  Value extends Parameters<(typeof setters)[PropName]['serialize']>[0],
>(
  deviceId: string,
  propertyName: PropName,
  options: Omit<
    Parameters<typeof useMutation<unknown, unknown, Value>>[0],
    'queryKey'
  > = {},
) => {
  const apiBackend = useStore(
    state => state.wiRocDevices[deviceId]?.apiBackend,
  );
  const updateQueryData = useUpdateQueryDataForDevice();

  return useMutation<unknown, unknown, Value>({
    ...options,
    mutationFn: async requestValue => {
      console.log('[REQ] Setting', propertyName, requestValue);

      const setter = setters[propertyName];

      const serializedValue = setter.serialize(
        requestValue as never, // ?? :'-(
      );

      const response = await apiBackend.setProperty(
        propertyName,
        serializedValue,
      );

      console.log('[REQ] Serialized response:', response);
      const responseValue = setter.deserializeResponse(response);
      console.log('[REQ] Deserialized response:', response);

      updateQueryData(
        deviceId,
        setter.responseTarget ?? (propertyName as GettablePropName),
        responseValue,
      );

      return responseValue;
    },
  });
};

// wrapper around queryClient.setQueryData, just to get unified logging
export const useUpdateQueryDataForDevice = () => {
  const queryClient = useQueryClient();
  return useCallback(
    (deviceId: string, propertyName: GetterName, value: unknown) => {
      if (value === undefined) {
        return;
      }
      const type = Array.isArray(value) ? '[]' : typeof value;

      queryClient.setQueryData(getKey(deviceId, propertyName), current => {
        console.log(
          `[REQ] Setting ${propertyName}: ${type} = ${JSON.stringify(value)}`,
        );
        if (propertyName === 'settings') {
          console.log('[REQ] Merging settings');
          console.log('[REQ]: Current:', type, current, current?.settings);
          const updatedValue = {
            settings: [...(current?.settings ?? []), value],
          };
          console.log('[REQ]: Updated:', type, updatedValue);
          return updatedValue;
        }
        return value;
      });
    },
    [queryClient],
  );
};

const getKey = (
  deviceId: string,
  propertyName: GetterName | SetterName,
): string[] => {
  return [
    'wiRocDevice',
    deviceId,
    'properties',
    propertyName.replace('/', '_'),
  ];
};