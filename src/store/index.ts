import AsyncStorage from '@react-native-async-storage/async-storage';
import {mapValues} from 'lodash';
import {create} from 'zustand';
import {createJSONStorage, devtools, persist} from 'zustand/middleware';
import {immer} from 'zustand/middleware/immer';

import {createBleSlice} from './slices/bleSlice';
import {createLoggerSlice} from './slices/loggerSlice';
import {createNotificationSlice} from './slices/notificationSlice';
import {createToastsSlice} from './slices/toastsSlice';
import {createWiRocDevicesSlice} from './slices/wiRocDevicesSlice';
import {StoreState} from './types';

export const useStore = create<StoreState>()(
  devtools(
    persist(
      immer((...args) => ({
        ...createBleSlice(...args),
        ...createLoggerSlice(...args),
        ...createNotificationSlice(...args),
        ...createToastsSlice(...args),
        ...createWiRocDevicesSlice(...args),
      })),
      {
        name: 'wiroc-store',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: state => ({
          wiRocDevices: mapValues(state.wiRocDevices, device => ({
            name: device.name,
            restApiHost: device.restApiHost,
            apiBackend: device.apiBackend,
            bleConnection: device.bleConnection
              ? {
                  deviceId: device.bleConnection.deviceId,
                  name: device.bleConnection.name,
                  status: 'disconnected',
                  rssi: null,
                }
              : null,
          })),
        }),
      },
    ),
  ),
);
