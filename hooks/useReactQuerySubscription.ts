import {useEffect} from 'react';
import {WiRocBleManager} from '../utils/wiRocBleManager';
import {useUpdateQueryDataForDevice} from './useWiRocPropertyQuery';
import {GettablePropName, getters} from '../api/transformers';
import {useQueryClient} from '@tanstack/react-query';
import {Punch, TestPunch} from '../api/types';

/**
 * Listens for streaming data from all BLE connected WiRoc devices,
 * and updates the react-query cache when new data comes in.
 */
export const useReactQuerySubscription = (wiRocBleManager: WiRocBleManager) => {
  const queryClient = useQueryClient();
  const updateQueryData = useUpdateQueryDataForDevice();

  // Get streaming properties into the query cache
  useEffect(() => {
    return wiRocBleManager.onPropertiesChanged((deviceId, newData) => {
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
        updateQueryData(deviceId, key as GettablePropName, parsedValue);
      });
    });
  }, [updateQueryData, wiRocBleManager]);

  // Get streaming punches into the query cache
  useEffect(() => {
    return wiRocBleManager.onPunchesRecieved(
      (deviceId, {punches: newPunches}) => {
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
      },
    );
  }, [updateQueryData, wiRocBleManager, queryClient]);

  // Get streaming sent test punches into the query cache
  useEffect(() => {
    return wiRocBleManager.onTestPunchesSent(
      (deviceId, {punches: sentPunches}) => {
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
              } and updating ${
                sentPunches.length - newPunches.length
              } existing`,
            );
            return [...updatedPunches, ...newPunches];
          },
        );
      },
    );
  }, [updateQueryData, wiRocBleManager, queryClient]);
};
