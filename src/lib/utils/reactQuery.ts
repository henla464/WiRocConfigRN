import {QueryClient, useQueryClient} from '@tanstack/react-query';
import {useEffect, useRef} from 'react';

import {GettablePropName, getters, setters} from '@api/transformers';
import {Punch, TestPunch} from '@api/types';
import {useWiRocDeviceApi} from '@lib/hooks/useWiRocDeviceApi';
import {log} from '@lib/log';
import {useStore} from '@store';

type GetterName = keyof typeof getters;
type SetterName = keyof typeof setters;

interface WiRocDeviceSubscriberProps {
  deviceId: string;
}

/**
 * Listens for streaming data from a WiRoc device,
 * and updates the react-query cache when new data comes in.
 */
export function WiRocDeviceSubscriber({deviceId}: WiRocDeviceSubscriberProps) {
  const wiRocDeviceApi = useWiRocDeviceApi(deviceId);
  const setDeviceName = useStore(state => state.setDeviceName);
  const queryClient = useQueryClient();

  const onPropertiesChangedSubscription = useRef<(() => void) | null>(null);
  const onPunchesRecievedSubscription = useRef<(() => void) | null>(null);
  const onTestPunchesSentSubscription = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Cancel old subscriptions
    onPropertiesChangedSubscription.current?.();
    onPunchesRecievedSubscription.current?.();
    onTestPunchesSentSubscription.current?.();

    onPropertiesChangedSubscription.current =
      wiRocDeviceApi.onPropertiesChanges(newData => {
        Object.entries(newData).forEach(([key, value]) => {
          if (key.trim().length === 0) {
            // Can end up here for "failed" resposnes?
            return;
          }

          const getter = getters[key as GettablePropName];
          if (!getter) {
            return;
          }

          let parsedValue;
          try {
            parsedValue = getter.deserialize(value);
          } catch (e) {
            log.warn(`Failed to deserialize ${key}: ${value}`);
            return;
          }

          if (key === 'wirocdevicename') {
            // HACK: When the device name changes, we should also
            // update the zustand state of it, since that is used
            // also when we're not connected.
            setDeviceName(deviceId, parsedValue as string);
          }

          updateQueryDataForDevice(
            queryClient,
            deviceId,
            key as GettablePropName,
            parsedValue,
          );
        });
      });

    onPunchesRecievedSubscription.current = wiRocDeviceApi.onPunchesRecieved(
      newPunches => {
        queryClient.setQueryData<Punch[]>(
          [deviceId, 'punches'],
          (previousPunches = []) => {
            log.debug(
              `[${deviceId}] Adding ${newPunches.length} new punch${
                newPunches.length === 1 ? '' : 'es'
              }`,
            );
            return [...previousPunches, ...newPunches];
          },
        );
      },
    );

    onTestPunchesSentSubscription.current = wiRocDeviceApi.onTestPunchesSent(
      sentPunches => {
        queryClient.setQueryData<TestPunch[]>(
          [deviceId, 'testPunches'],
          (previousPunches = [] as TestPunch[]) => {
            const newPunches = sentPunches.filter(p =>
              previousPunches.every(p2 => p2.Id !== p.Id),
            );
            const updatedPunches = previousPunches.map(p => {
              return sentPunches.find(p2 => p2.Id === p.Id) ?? p;
            });
            log.debug(
              `[${deviceId}] Adding ${newPunches.length} new test punch${
                sentPunches.length === 1 ? '' : 'es'
              } and updating ${
                sentPunches.length - newPunches.length
              } existing`,
            );
            return [...updatedPunches, ...newPunches];
          },
        );
      },
    );
  }, [wiRocDeviceApi, deviceId, queryClient, setDeviceName]);

  return null;
}

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
    log.debug(
      `[${deviceId}] Setting ${propertyName}: ${type} = ${JSON.stringify(
        value,
      )}`,
    );
    if (propertyName === 'settings') {
      log.debug('[${deviceId}] Merging settings');
      log.debug('[${deviceId}] Current:', type, current, current?.settings);
      const updatedValue = {
        settings: [...(current?.settings ?? []), value],
      };
      log.debug('[${deviceId}] Updated:', type, updatedValue);
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
