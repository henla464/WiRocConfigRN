import {StateCreator} from 'zustand';

import {BleSliceState} from './slices/bleSlice';
import {LoggerSliceState} from './slices/loggerSlice';
import {NotificationSliceState} from './slices/notificationSlice';
import {WiRocDevicesSliceState} from './slices/wiRocDevicesSlice';

export type StoreState = NotificationSliceState &
  LoggerSliceState &
  BleSliceState &
  WiRocDevicesSliceState;

export type ImmerStateCreator<T> = StateCreator<
  StoreState,
  [['zustand/immer', never], never],
  [],
  T
>;
