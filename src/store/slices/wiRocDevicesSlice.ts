import {ImmerStateCreator} from '../types';

const USE_HARD_CODED_REST_DEVICE = false;

export interface WiRocDevicesSliceState {
  /**
   * The id of the 'active' device, i.e. the one
   * we are currently showing in the UI.
   */
  activeDeviceId: string | null;
  addWiRocDevice: (deviceId: string, device: WiRocDevice) => void;
  setActiveDeviceId: (deviceId: string | null) => void;
  setDeviceName: (deviceId: string, name: string) => void;

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
   * The API backend to use for this device.
   */
  apiBackend: 'ble' | 'rest' | 'demo';
}

export interface WiRocBleConnection {
  deviceId: string;
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
    setDeviceName: (deviceId, name) => {
      set(state => {
        state.wiRocDevices[deviceId].name = name;
      });
    },
    addWiRocDevice: (deviceId, device) => {
      set(state => {
        state.wiRocDevices[deviceId] = device;
      });
    },
    wiRocDevices: Object.assign(
      {
        '11:22:33:44:55:66': {
          name: 'Demo 1',
          apiBackend: 'demo',
          bleConnection: null,
          restApiHost: null,
        } as WiRocDevice,
        '99:88:77:66:55:44': {
          name: 'Demo 2',
          apiBackend: 'demo',
          bleConnection: null,
          restApiHost: null,
        } as WiRocDevice,
      },
      USE_HARD_CODED_REST_DEVICE
        ? {
            rest: (() => {
              const host = '192.168.0.108:5000';
              return {
                name: 'Rest test',
                apiBackend: 'rest',
                bleConnection: null,
                restApiHost: host,
              } as WiRocDevice;
            })(),
          }
        : undefined,
    ),
  };
};
