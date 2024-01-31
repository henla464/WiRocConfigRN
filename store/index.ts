import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';
import {createNotificationSlice} from './slices/notificationSlice';
import {createLoggerSlice} from './slices/loggerSlice';
import {createBleSlice} from './slices/bleSlice';
import {createWiRocDevicesSlice} from './slices/wiRocDevicesSlice';
import {StoreState} from './types';

export const useStore = create<StoreState>()(
  immer((...args) => ({
    ...createLoggerSlice(...args),
    ...createNotificationSlice(...args),
    ...createBleSlice(...args),
    ...createWiRocDevicesSlice(...args),
  })),
);
