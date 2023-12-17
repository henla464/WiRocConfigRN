import {useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {BleManager, Device} from 'react-native-ble-plx';
import DeviceInfo from 'react-native-device-info';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';

type PermissionCallback = (result: boolean) => void;

const bleManager = new BleManager();

export interface BluetoothLowEnergyApi {
  requestPermissions(callback: PermissionCallback): Promise<void>;
  scanForDevices(): void;
  stopScanningForDevices(): void;
  allDevices: Device[];
  connectToDevice: (device: Device) => Promise<void>;
  connectedDevice: Device | null;
  disconnectDevice: (device: Device) => Promise<void>;
}

export default function useBLE(): BluetoothLowEnergyApi {
  const apiService = 'fb880900-4ab2-40a2-a8f0-14cc1c2e5608';
  const propertyCharacteristic = 'fb880912-4ab2-40a2-a8f0-14cc1c2e5608';
  const punchesCharacteristic = 'fb880901-4ab2-40a2-a8f0-14cc1c2e5608'; //N: subscribe to punches
  const testPunchesCharacteristic = 'fb880907-4ab2-40a2-a8f0-14cc1c2e5608'; //N,R,W: test sending punches, subscribe, periodic

  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const requestPermissions = async (callback: PermissionCallback) => {
    if (Platform.OS === 'android') {
      const apiLevel = await DeviceInfo.getApiLevel();
      if (apiLevel < 31) {
        const grantedStatus = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'Bluetooth Low Energy behöver åtkomst till platsinformation',
            buttonNegative: 'Avbryt',
            buttonPositive: 'OK',
            buttonNeutral: 'Kanske senare',
          },
        );
        callback(grantedStatus === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await requestMultiple([
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ]);

        const isAllPermissionsGranted =
          result['android.permission.BLUETOOTH_SCAN'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_CONNECT'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED;
        callback(isAllPermissionsGranted);
      }
    } else {
      callback(true);
    }
  };

  const scanForDevices = () => {
    bleManager.startDeviceScan([apiService], null, (error, newDevice) => {
      if (error) {
        console.log(error);
      }
      if (newDevice) {
        setAllDevices((prevState: Device[]) => {
          let index = prevState.findIndex(
            deviceInArr => newDevice.id === deviceInArr.id,
          );
          if (index > -1) {
            let newState = [...prevState];
            newState[index] = newDevice;
            return newState;
          } else {
            return [...prevState, newDevice];
          }
        });
      }
    });
  };

  const stopScanningForDevices = () => {
    try {
      bleManager.stopDeviceScan();
    } catch (e) {
      console.log('stopScanningForDevices: ' + e);
    }
  };

  const connectToDevice = async (device: Device) => {
    try {
      if (connectedDevice !== null && device.id === connectedDevice.id) {
        console.log('Already connected to this device');
        return;
      }
      const deviceConnected = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnected);
      await deviceConnected.discoverAllServicesAndCharacteristics();
      //bleManager.stopDeviceScan();
    } catch (e) {
      console.log('ERROR IN CONNECTION');
    }
  };

  const disconnectDevice = async (device: Device) => {
    try {
      let deviceToDisconnect = device === null ? connectedDevice : device;
      if (deviceToDisconnect === null) {
        console.log('disconnectDevice: Not connected to a device');
        return;
      }
      await deviceToDisconnect.cancelConnection();
      if (deviceToDisconnect.id === connectedDevice?.id) {
        setConnectedDevice(null);
      }
    } catch (e) {
      console.log('ERROR IN DISCONNECTION: ' + e);
    }
  };

  return {
    requestPermissions,
    scanForDevices,
    stopScanningForDevices,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectDevice,
  };
}
