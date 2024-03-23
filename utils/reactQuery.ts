import {GettablePropName, getters, setters} from '../api/transformers';
import {QueryClient} from '@tanstack/react-query';
import {Punch, TestPunch, WiRocApiBackend} from '../api/types';

type GetterName = keyof typeof getters;
type SetterName = keyof typeof setters;

const devices = new Set<string>();

/**
 * Listens for streaming data from all BLE connected WiRoc devices,
 * and updates the react-query cache when new data comes in.
 */
export const setupReactQuerySubscriptionToDevice = (
  queryClient: QueryClient,
  apiBackend: WiRocApiBackend,
  deviceId: string,
) => {
  if (devices.has(deviceId)) {
    console.warn(
      `[REQ][useReactQuerySubscription] Already listening for device ${deviceId}`,
    );
    return;
  }
  devices.add(deviceId);

  apiBackend.onPropertiesChanges(newData => {
    Object.entries(newData).forEach(([key, value]) => {
      if (key.trim().length === 0) {
        // Can end up here for "failed" resposnes?
        return;
      }

      const getter = getters[key as GettablePropName];
      if (!getter) {
        console.warn(
          `[REQ][useReactQuerySubscription] No getter for property "${key}"`,
        );
        return;
      }

      const parsedValue = getter.deserialize(value);
      console.log(
        '[REQ][useReactQuerySubscription] update value for',
        deviceId,
        key,
        parsedValue,
      );
      updateQueryDataForDevice(
        queryClient,
        deviceId,
        key as GettablePropName,
        parsedValue,
      );
    });
  });

  apiBackend.onPunchesRecieved(newPunches => {
    queryClient.setQueryData<Punch[]>(
      [deviceId, 'punches'],
      (previousPunches = []) => {
        console.log(
          `[REQ][useReactQuerySubscription] Adding ${
            newPunches.length
          } new punch${newPunches.length === 1 ? '' : 'es'}`,
        );
        return [...previousPunches, ...newPunches];
      },
    );
  });

  apiBackend.onTestPunchesSent(sentPunches => {
    queryClient.setQueryData<TestPunch[]>(
      [deviceId, 'testPunches'],
      (previousPunches = [] as TestPunch[]) => {
        const newPunches = sentPunches.filter(p =>
          previousPunches.every(p2 => p2.Id !== p.Id),
        );
        const updatedPunches = previousPunches.map(p => {
          return sentPunches.find(p2 => p2.Id === p.Id) ?? p;
        });
        console.log(
          `[REQ][useReactQuerySubscription] Adding ${
            newPunches.length
          } new test punch${
            sentPunches.length === 1 ? '' : 'es'
          } and updating ${sentPunches.length - newPunches.length} existing`,
        );
        return [...updatedPunches, ...newPunches];
      },
    );
  });
};

// wrapper around queryClient.setQueryData, just to get unified logging
export const updateQueryDataForDevice = (
  queryClient: QueryClient,
  deviceId: string,
  propertyName: GetterName,
  value: unknown,
) => {
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
};

export const getKey = (
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
