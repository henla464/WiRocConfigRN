import {createDemoApiBackend} from '../../api/backends/demo';
import {createRestApiBackend} from '../../api/backends/rest';
import {WiRocApiBackend} from '../../api/types';
import {ImmerStateCreator} from '../types';

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
    wiRocDevices: {
      '11:22:33:44:55:66': {
        name: 'Demo 1',
        bleConnection: null,
        restApiHost: null,
        apiBackend: createDemoApiBackend('Demo 1'),
      },
      '99:88:77:66:55:44': {
        name: 'Demo 2',
        bleConnection: null,
        restApiHost: null,
        apiBackend: createDemoApiBackend('Demo 2'),
      },
      // test: {
      //   name: 'Rest test',
      //   bleConnection: null,
      //   restApiHost: null,
      //   apiBackend: createRestApiBackend('192.168.0.108:5000'),
      // },
    },
  };
};
