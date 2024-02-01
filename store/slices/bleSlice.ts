import {logger} from '../../hooks/useLogger';
import {ImmerStateCreator} from '../types';
import {requestBlePermissions} from '../../utils/blePermissions';
import {WiRocBleConnection} from './wiRocDevicesSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {wiRocBleManager} from '../../App';
import {createBleApiBackend} from '../../api/backends/ble';

type DeviceId = string;

export interface BleSliceState {
  isScanning: boolean;
  startBleScan: () => void;
  stopBleScan: () => void;
  connectBleDevice: (deviceId: DeviceId) => Promise<void>;
  disconnectBleDevice: (deviceId: DeviceId) => Promise<void>;
  syncKnownDevices: () => Promise<void>;
}

export const createBleSlice: ImmerStateCreator<BleSliceState> = (set, get) => {
  // util for setting BLE connection properties of a WiRocDevice
  const setWiRocConnection = (
    deviceId: DeviceId,
    callback: (bleConnectionState: WiRocBleConnection) => void,
  ) => {
    set(state => {
      const bleConnection = state.wiRocDevices[deviceId].bleConnection;
      if (bleConnection === null) {
        throw new Error('BLE connection to device not known');
      }
      callback(bleConnection);
    });
  };

  wiRocBleManager.onDeviceDisconnected((device, wasExpected) => {
    logger.info('BLE', 'onDeviceConnected', `Disconnected from ${device.id}`);
    setWiRocConnection(device.id, state => (state.status = 'disconnected'));
    if (!wasExpected) {
      get().addNotification({
        type: 'info',
        message: `Anslutningen till ${device.name} avbröts.`,
      });
    }
  });

  return {
    bleDevices: {},
    isScanning: false,
    stopBleScan: () => {
      logger.info('BLE', 'stopScan', '[BLE] Stopping scan...');
      wiRocBleManager.stopDeviceScan();
      set(state => {
        state.isScanning = false;
      });
    },
    startBleScan: async () => {
      logger.info('BLE', 'startScan', 'Scanning...');
      logger.info('BLE', 'startScan', 'Scanning...');
      console.log('[BLE] Checking permissions...');
      const granted = await requestBlePermissions();
      if (!granted) {
        console.log('[BLE] Permissions not granted');
        return;
      }
      set(state => {
        state.isScanning = true;
      });

      try {
        wiRocBleManager.startDeviceScan(async device => {
          if (!device) {
            return;
          }

          const isConnected = await device.isConnected();

          console.log('[BLE] Scanned device', device.id);
          if (device.id in get().wiRocDevices) {
            // We already have this device,
            // update connection status with latest info:
            setWiRocConnection(device.id, state => (state.rssi = device.rssi));
            setWiRocConnection(device.id, state => (state.name = device.name));
            setWiRocConnection(
              device.id,
              state =>
                (state.status = isConnected ? 'connected' : 'disconnected'),
            );
            return;
          }

          console.log('[BLE] Adding device', device.id, 'to known devices');
          set(state => {
            state.wiRocDevices[device.id] = {
              name: device.name,
              bleConnection: {
                name: device.name,
                rssi: device.rssi,
                status: isConnected ? 'connected' : 'disconnected',
              },
              apiBackend: createBleApiBackend(device.id),
              restApiHost: null,
            };
          });

          const knownDevices = await getKnownDevices();
          await AsyncStorage.setItem(
            'knownDevices',
            JSON.stringify({
              ...knownDevices,
              [device.id]: device.name ?? knownDevices[device.id]?.name ?? null,
            }),
          );
        });
      } catch (err) {
        set(state => {
          state.isScanning = false;
        });
        // TODO user message
        console.error('Error on scan', err);
      }
      setTimeout(() => {
        console.log('[BLE] Stopping scan...');
        wiRocBleManager.stopDeviceScan();
        set(state => {
          state.isScanning = false;
        });
      }, 10e3);
    },
    async connectBleDevice(deviceId) {
      console.log('[BLE] Connecting to', deviceId);
      setWiRocConnection(deviceId, state => (state.status = 'connecting'));

      try {
        await wiRocBleManager.connectToDevice(deviceId);
        setWiRocConnection(deviceId, state => (state.status = 'connected'));
        set(state => {
          state.wiRocDevices[deviceId].apiBackend =
            createBleApiBackend(deviceId);
        });
        console.log('[BLE] Connected to', deviceId);
      } catch (err) {
        console.error('Error while connecting', err);
        setWiRocConnection(deviceId, state => (state.status = 'disconnected'));
        throw err;
      }
    },
    async disconnectBleDevice(deviceId) {
      try {
        console.log('[BLE] Disconnecting from', deviceId);
        await wiRocBleManager.disconnectFromDevice(deviceId);
        // TODO cancel transactions and more?
        setWiRocConnection(deviceId, state => (state.status = 'disconnected'));
      } catch (err) {
        // TODO user message
        console.error('Error while disconnecting', err);
        try {
          const isStillConnected = await wiRocBleManager.isDeviceConnected(
            deviceId,
          );
          setWiRocConnection(
            deviceId,
            state =>
              (state.status = isStillConnected ? 'connected' : 'disconnected'),
          );
        } catch {
          // TODO user message
          console.error(
            'Error while checking connection status after failed disconnect. Assuming disconnected state.',
            err,
          );
          setWiRocConnection(
            deviceId,
            state => (state.status = 'disconnected'),
          );
        }
      }
    },

    async syncKnownDevices() {
      const knownDevices = await getKnownDevices();
      for (const [deviceId, deviceName] of Object.entries(knownDevices)) {
        set(state => {
          state.wiRocDevices[deviceId] ??= {
            ...(state.wiRocDevices[deviceId] ?? {
              name: null,
              data: null,
              bleConnection: {
                name: deviceName as string,
                status: 'disconnected',
                rssi: null,
              },
              apiBackend: null,
            }),
            name: deviceName as string,
          };
        });
      }
    },
  };
};

const getKnownDevices = async () => {
  const knownDevicesString = await AsyncStorage.getItem('knownDevices');
  if (!knownDevicesString) {
    return {};
  }
  try {
    return JSON.parse(knownDevicesString);
  } catch (err) {
    console.warn('Error while parsing knownDevices', err);
    return {};
  }
};
