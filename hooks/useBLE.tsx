import {useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {
  Base64,
  BleError,
  BleManager,
  Characteristic,
  Device,
  Subscription,
} from 'react-native-ble-plx';
import DeviceInfo from 'react-native-device-info';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';

global.Buffer = require('buffer').Buffer;

type PermissionCallback = (result: boolean) => void;

type callbackFn = (propName: string, propValue: string) => void;
export interface BluetoothLowEnergyApi {
  requestPermissions(callback: PermissionCallback): Promise<void>;
  scanForDevices(): void;
  stopScanningForDevices(): void;
  allDevices: Device[];
  connectToDevice: (device: Device) => Promise<void>;
  connectedDevice: Device | null;
  disconnectDevice: (device: Device) => Promise<void>;
  requestProperty: (
    device: Device,
    propName: string,
    callback: callbackFn,
  ) => Promise<Characteristic | null>;
  saveProperty: (
    device: Device,
    propName: string,
    propValue: string,
  ) => Promise<Characteristic | null>;
}

interface PropNotificationSubscriber {
  propName: string;
  callback: callbackFn;
}

const bleManager = new BleManager();
var propertyNotificationSubscriptions: PropNotificationSubscriber[] = [
  {
    propName: 'asdf',
    callback: (a: string, b: string) => {
      console.log(a + b);
    },
  },
];
let propertySubscription: Subscription;

export default function useBLE(): BluetoothLowEnergyApi {
  const apiService = 'fb880900-4ab2-40a2-a8f0-14cc1c2e5608';
  const propertyCharacteristic = 'fb880912-4ab2-40a2-a8f0-14cc1c2e5608';
  const punchesCharacteristic = 'fb880901-4ab2-40a2-a8f0-14cc1c2e5608'; //N: subscribe to punches
  const testPunchesCharacteristic = 'fb880907-4ab2-40a2-a8f0-14cc1c2e5608'; //N,R,W: test sending punches, subscribe, periodic

  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);

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

  const decodeCharacteristicValueToString = (value: Base64) => {
    return Buffer.from(value, 'base64').toString('utf8');
  };

  const encodeStringToBase64 = (value: string) => {
    console.log(Buffer.from(value).toString('base64'));
    return Buffer.from(value).toString('base64');
  };

  const notify = (
    error: BleError | null,
    characteristic: Characteristic | null,
  ): void => {
    if (error !== null) {
      if (isDisconnecting && error.message === 'Operation was cancelled') {
        console.log('Notify error ' + error.name);
        console.log('Notify error ' + error);
      }
    } else if (characteristic !== null && characteristic.value !== null) {
      let propAndValueStrings = decodeCharacteristicValueToString(
        characteristic.value,
      );
      console.log('property value!: ' + propAndValueStrings);
      let propAndValuesArray = propAndValueStrings.split('|');
      for (const propAndValue of propAndValuesArray) {
        console.log('propAndValue: ' + propAndValue);
        let propAndValueArray = propAndValue.split('\t', 2);
        let propName = propAndValueArray[0];
        let propValue = propAndValueArray[1];
        console.log('propName: ' + propName);
        console.log('propValue: ' + propValue);
        // Find all subscribers and call them
        console.log(propertyNotificationSubscriptions);
        for (const propNotificationSub of propertyNotificationSubscriptions) {
          console.log('for ..of propertyNotificationSubscriptions');
          console.log(propNotificationSub.propName);
          if (propNotificationSub.propName === propName) {
            propNotificationSub.callback(propName, propValue);
          }
        }
      }
    }
  };

  const enablePropertyNotification = (device: Device) => {
    try {
      propertySubscription = device.monitorCharacteristicForService(
        apiService,
        propertyCharacteristic,
        notify,
        'propertyNotificationTransaction',
      );
    } catch (e) {
      console.log('exception enablePropertyNotification: ' + e);
    }
    console.log('enablepropertyNotification');
  };

  const connectToDevice = async (device: Device) => {
    try {
      if (connectedDevice !== null && device.id === connectedDevice.id) {
        console.log('Already connected to this device');
        return;
      } else {
        console.log('Connecting to: ' + device.name);
      }
      const deviceConnected = await bleManager.connectToDevice(device.id);
      await deviceConnected.discoverAllServicesAndCharacteristics();
      console.log('connectToDevice: discoverAllServicesAndCharacteristics');
      enablePropertyNotification(device);
      console.log('connectToDevice: enablePropertyNotification');
      setConnectedDevice(deviceConnected);
      console.log('connectToDevice: setConnectedDevice');
      //bleManager.stopDeviceScan();
    } catch (e) {
      console.log('ERROR IN CONNECTION');
    }
  };

  const disconnectDevice = async (device: Device) => {
    try {
      console.log('disconnectDevice: ' + device.id);
      setIsDisconnecting(true);
      let deviceToDisconnect = device === null ? connectedDevice : device;
      if (deviceToDisconnect === null) {
        console.log('disconnectDevice: Not connected to a device');
        return;
      }
      console.log('disconnectDevice 1');
      if (propertySubscription) {
        propertySubscription.remove();
      }
      console.log('disconnectDevice 1.1');
      bleManager.cancelTransaction('propertyNotificationTransaction');
      console.log('disconnectDevice 2');
      await deviceToDisconnect.cancelConnection();
      console.log('disconnectDevice 3');
      if (deviceToDisconnect.id === connectedDevice?.id) {
        setConnectedDevice(null);
      }
      console.log('disconnectDevice 4');
      setIsDisconnecting(false);
    } catch (e) {
      setConnectedDevice(null);
      setIsDisconnecting(false);
      console.log('ERROR IN DISCONNECTION: ' + e);
    }
  };

  const requestProperty = async (
    device: Device,
    propName: string,
    callback: callbackFn,
  ): Promise<Characteristic | null> => {
    try {
      console.log('deviceName: ' + device.name);
      console.log('requestProperty: ' + propName);
      propertyNotificationSubscriptions.push({
        propName: propName,
        callback: callback,
      });
      console.log(propertyNotificationSubscriptions);
      console.log('requestProperty 2');
      let characteristic =
        await device.writeCharacteristicWithResponseForService(
          apiService,
          propertyCharacteristic,
          encodeStringToBase64(propName),
        );
      console.log('requestProperty 3');
      return characteristic;
    } catch (e) {
      console.log('ERROR IN requestProperty: ' + e);
      return null;
    }
  };

  const saveProperty = async (
    device: Device,
    propName: string,
    propValue: string,
  ): Promise<Characteristic | null> => {
    try {
      console.log('saveProperty:deviceName: ' + device.name);
      console.log('saveProperty:propName: ' + propName);
      console.log('saveProperty:propValue: ' + propValue);
      var propNameAndPropValue = propName + '\t' + propValue;
      let characteristic =
        await device.writeCharacteristicWithResponseForService(
          apiService,
          propertyCharacteristic,
          encodeStringToBase64(propNameAndPropValue),
        );
      console.log('saveproperty 2');
      return characteristic;
    } catch (e) {
      console.log('ERROR IN saveProperty: ' + e);
      return null;
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
    requestProperty,
    saveProperty,
  };
}
