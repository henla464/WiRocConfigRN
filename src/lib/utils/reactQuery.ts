import {QueryClient, useQueryClient} from '@tanstack/react-query';
import {useEffect, useRef} from 'react';

import {GettablePropName, getters, setters} from '@api/transformers';
import {Settings} from '@api';
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
            const statusOrder: Record<string, number> = {
              'Not added': 0,
              'No subscr.': 1,
              Added: 2,
              Sent: 3,
              Acked: 4,
              'Not acked': 4,
              Failed: 4,
            };
            const getOrder = (status: string) => statusOrder[status] ?? 3;
            const extractPrefix = (id: string) => {
              const idx = id.lastIndexOf('_');
              return idx >= 0 ? id.substring(0, idx + 1) : null;
            };
            const existingPrefixes = new Set(
              previousPunches
                .map(p => extractPrefix(p.Id))
                .filter(Boolean) as string[],
            );

            const newPunches = sentPunches.filter(p => {
              // Not a new ID at all
              if (previousPunches.some(p2 => p2.Id === p.Id)) return false;
              // Don't add transient rows (Not added/No subscr./Added) as new
              // if a row with the same TestPunchData.id prefix already exists
              const transient =
                p.Status === 'Not added' ||
                p.Status === 'No subscr.' ||
                p.Status === 'Added';
              if (transient) {
                const prefix = extractPrefix(p.Id);
                if (prefix && existingPrefixes.has(prefix)) return false;
              }
              return true;
            });

            let updatedPunches = previousPunches.map(p => {
              const incoming = sentPunches.find(p2 => p2.Id === p.Id);
              // Only update if the incoming status is at least as far along
              // (BLE notifications can arrive out of order)
              if (incoming && getOrder(incoming.Status) < getOrder(p.Status)) {
                return p;
              }
              return incoming ?? p;
            });

            // Remove stale transient rows whose Id prefix (e.g. "12_")
            // was replaced by rows with the same prefix (e.g. "12_1", "12_3")
            const replacementPrefixes = new Set(
              sentPunches
                .filter(
                  p => p.Status !== 'Not added' && p.Status !== 'No subscr.',
                )
                .map(p => extractPrefix(p.Id))
                .filter(Boolean) as string[],
            );
            updatedPunches = updatedPunches.filter(p => {
              if (p.Status !== 'Not added' && p.Status !== 'No subscr.') {
                return true;
              }
              return !replacementPrefixes.has(p.Id);
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
      const newSetting = value as {Key: string; Value: string};

      log.debug(`[${deviceId}] Merging settings`);
      log.debug(
        `[${deviceId}] Current:`,
        type,
        current,
        (current as Settings)?.settings,
      );
      const updatedSettings: {Key: string; Value: string}[] = (
        (current as Settings)?.settings ?? []
      ).map((setting: {Key: string; Value: string}) => {
        if (setting?.Key === newSetting?.Key) {
          return newSetting;
        }
        return setting;
      });

      if (!updatedSettings.some(setting => setting?.Key === newSetting?.Key)) {
        updatedSettings.push(newSetting);
      }

      const updatedValue = {
        settings: updatedSettings,
      };

      log.debug(`[${deviceId}] Updated:`, type, updatedValue);
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
