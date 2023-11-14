import {useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {BleManager, Device} from 'react-native-ble-plx';

type PermissionCallback = (result: boolean) => void;

const bleManager = new BleManager();

interface BluetoothLowEnergyApi {
  requestPermissions(callback: PermissionCallback): Promise<void>;
  scanForDevices(): void;
  allDevices: Device[];
}

export default function useBLE(): BluetoothLowEnergyApi {
  const apiService = 'fb880900-4ab2-40a2-a8f0-14cc1c2e5608';
  const propertyCharacteristic = 'fb880912-4ab2-40a2-a8f0-14cc1c2e5608';
  const punchesCharacteristic = 'fb880901-4ab2-40a2-a8f0-14cc1c2e5608'; //N: subscribe to punches
  const testPunchesCharacteristic = 'fb880907-4ab2-40a2-a8f0-14cc1c2e5608'; //N,R,W: test sending punches, subscribe, periodic

  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const requestPermissions = async (callback: PermissionCallback) => {
    if (Platform.OS === 'android') {
      const grantedStatus = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Bluetooth Low Energy behöver åtkomst till platsinformation',
          buttonNegative: 'Avbryt',
          buttonPositive: 'OK',
          buttonNeutral: 'Kanske senare',
        },
      );
      callback(grantedStatus === PermissionsAndroid.RESULTS.GRANTED);
    } else {
      callback(true);
    }
  };

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) => {
    return devices.findIndex(device => nextDevice.id === device.id) > -1;
  };

  const scanForDevices = () => {
    bleManager.startDeviceScan([apiService], null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicateDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });
  };

  return {
    requestPermissions,
    scanForDevices,
    allDevices,
  };
}
