import {WiRocApiBackend} from '@api/types';
import {setupReactQuerySubscriptionToDevice} from '@lib/utils/reactQuery';

import {queryClient} from '../../../queryClient';
import {createDemoApiBackend} from '../../api/backends/demo';
import {createRestApiBackend} from '../../api/backends/rest';
import {ImmerStateCreator} from '../types';

const USE_HARD_CODED_REST_DEVICE = false;

export interface WiRocDevicesSliceState {
  /**
   * The id of the 'active' device, i.e. the one
   * we are currently showing in the UI.
   */
  activeDeviceId: string | null;
  setActiveDeviceId: (deviceId: string | null) => void;

  /**
   * Record of all known devices.
   * The key is the device id.
   */
  wiRocDevices: Record<string, WiRocDevice>;
}

export interface WiRocDevice {
  name: string | null;

  /**
   * Information about the BLE connection, if any, to the device.
   */
  bleConnection: WiRocBleConnection | null;

  /**
   * Information about the REST API connection, if any, to the device.
   */
  restApiHost: string | null;

  /**
   * The API backend to use for this device (BLE, REST or demo).
   */
  apiBackend: WiRocApiBackend;
}

export interface WiRocBleConnection {
  name: string | null;
  status: 'connected' | 'connecting' | 'disconnected';
  rssi: number | null;
}

export const createWiRocDevicesSlice: ImmerStateCreator<
  WiRocDevicesSliceState
> = set => {
  return {
    activeDeviceId: null,
    setActiveDeviceId: deviceId => {
      set(state => {
        state.activeDeviceId = deviceId;
      });
    },
    addWiRocDevice: (deviceId: string, wiRocDevice: WiRocDevice) => {
      set(state => {
        state.wiRocDevices[deviceId] = wiRocDevice;
      });
    },
    wiRocDevices: {
      ...createDemoDevice('11:22:33:44:55:66', 'Demo 1'),
      ...createDemoDevice('99:88:77:66:55:44', 'Demo 2'),
      ...(USE_HARD_CODED_REST_DEVICE
        ? createRestDevice('rest', 'Rest test', '192.168.0.108:5000')
        : {}),
    },
  };
};

const createDemoDevice = (id: string, name: string) => {
  const apiBackend = createDemoApiBackend(name);
  setupReactQuerySubscriptionToDevice(queryClient, apiBackend, id);
  return {
    [id]: {
      name,
      bleConnection: null,
      restApiHost: null,
      apiBackend,
    },
  };
};

const createRestDevice = (id: string, name: string, host: string) => {
  const apiBackend = createRestApiBackend(host);
  setupReactQuerySubscriptionToDevice(queryClient, apiBackend, id);
  return {
    [id]: {
      name,
      bleConnection: null,
      restApiHost: host,
      apiBackend,
    },
  };
};
