import {useMutation, useQuery} from '@tanstack/react-query';

import {
  GettablePropName,
  GetterValueOf,
  SettableValues,
  getters,
  setters,
} from '@api/transformers';
import {log} from '@lib/log';

import {queryClient} from '../../../queryClient';
import {getKey, updateQueryDataForDevice} from '../utils/reactQuery';
import {useWiRocDeviceApi} from './useWiRocDeviceApi';

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
  const api = useWiRocDeviceApi(deviceId);

  const query = useQuery<unknown, unknown, GetterValueOf<PropName>>({
    queryKey: getKey(deviceId, propertyName),
    queryFn: async () => {
      // Request value for property from BLE/REST etc:
      const value = await api.getProperty(propertyName);

      // API will always return string. Deserialize it to a nice type:
      const deserializedValue = getters[propertyName].deserialize(value);

      // Return the deserialized value to the hook user.
      // It will also be put in the react-query cache.
      return deserializedValue as GetterValueOf<PropName>;
    },
    staleTime: Infinity,
    retry: false,
    ...options,
  });
  return {
    ...query,
    propertyName,
  };
};

export const useWiRocPropertiesMutation = (deviceId: string) => {
  const api = useWiRocDeviceApi(deviceId);

  return useMutation({
    mutationFn: async (data: Partial<SettableValues>) => {
      for (const [_propertyName, requestValue] of Object.entries(data)) {
        const propertyName = _propertyName as SetterName;
        const setter = setters[propertyName];
        if (!setter) {
          log.warn('No setter for property', propertyName, requestValue);
          throw new Error('No setter for property ' + propertyName);
        }
        log.info('Setting', propertyName, requestValue);
        const response = await api.setProperty(
          propertyName,
          setter.serialize(requestValue as never), // ?? :'-(
        );
        log.debug('Serialized response:', response);

        const responseValue = setter.deserializeResponse(response);

        log.debug('Deserialized response:', responseValue);

        updateQueryDataForDevice(
          queryClient,
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
  const api = useWiRocDeviceApi(deviceId);

  return useMutation<unknown, unknown, Value>({
    ...options,
    mutationFn: async requestValue => {
      log.info('Setting', propertyName, requestValue);

      const setter = setters[propertyName];

      const serializedValue = setter.serialize(
        requestValue as never, // ?? :'-(
      );

      const response = await api.setProperty(propertyName, serializedValue);

      log.debug('Serialized response:', response);
      const responseValue = setter.deserializeResponse(response);
      log.debug('Deserialized response:', response);

      updateQueryDataForDevice(
        queryClient,
        deviceId,
        setter.responseTarget ?? (propertyName as GettablePropName),
        responseValue,
      );

      return responseValue;
    },
  });
};
