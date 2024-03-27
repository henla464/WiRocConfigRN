import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';

import {createBleSlice} from './slices/bleSlice';
import {createLoggerSlice} from './slices/loggerSlice';
import {createNotificationSlice} from './slices/notificationSlice';
import {createToastsSlice} from './slices/toastsSlice';
import {createWiRocDevicesSlice} from './slices/wiRocDevicesSlice';
import {StoreState} from './types';

export const useStore = create<StoreState>()(
  immer((...args) => ({
    ...createBleSlice(...args),
    ...createLoggerSlice(...args),
    ...createNotificationSlice(...args),
    ...createToastsSlice(...args),
    ...createWiRocDevicesSlice(...args),
  })),
);
