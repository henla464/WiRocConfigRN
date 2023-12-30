import {useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
  Subscription,
} from 'react-native-ble-plx';
import DeviceInfo from 'react-native-device-info';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';

let demoDeviceData = require('./demoDeviceData.json');

global.Buffer = require('buffer').Buffer;

type PermissionCallback = (result: boolean) => void;

type callbackFn = (propName: string, propValue: string) => void;
export interface BluetoothLowEnergyApi {
  requestPermissions(callback: PermissionCallback): Promise<void>;
  scanForDevices(): void;
  stopScanningForDevices(): void;
  allDevices: Device[];
  connectToDevice: (device: Device | IDemoDevice) => Promise<void>;
  connectedDevice: Device | IDemoDevice | null;
  disconnectDevice: (device: Device | IDemoDevice) => Promise<void>;
  requestProperty: (
    device: Device | IDemoDevice,
    componentRequesting: string,
    propName: string,
    callback: callbackFn,
  ) => Promise<Characteristic | null>;
  saveProperty: (
    device: Device | IDemoDevice,
    propName: string,
    propValue: string,
  ) => Promise<Characteristic | null>;
  enablePunchesNotification: (
    device: Device | IDemoDevice,
    callback: callbackFn,
  ) => void;
  disablePunchesNotification: (device: Device | IDemoDevice) => void;
  enableTestPunchesNotification: (
    device: Device | IDemoDevice,
    callback: callbackFn,
  ) => void;
  disableTestPunchesNotification: (device: Device | IDemoDevice) => void;
  startSendTestPunches: (
    device: Device | IDemoDevice,
    propName: string,
    propValue: string,
  ) => Promise<Characteristic | null>;
}

interface IDemoDevice {
  demo: string;
  id: string;
  name: string;
  isConnected: boolean;
}

function instanceOfIDemoDevice(object: any): object is IDemoDevice {
  return 'demo' in object;
}

interface IPropNotificationSubscriber {
  componentRequesting: string;
  propName: string;
  callback: callbackFn;
}

const bleManager = new BleManager();
var propertyNotificationSubscriptions: IPropNotificationSubscriber[] = [];
let propertySubscription: Subscription | null;
let punchesSubscription: Subscription | null;
let testPunchesSubscription: Subscription | null;
let punchesCallbackFunction: callbackFn;
let testPunchesCallbackFunction: callbackFn;

export const demoDevice: IDemoDevice = {
  demo: 'Yes I am a Demo Device',
  id: '11:22:33:44:55:66',
  name: 'Demo Device',
  isConnected: false,
};
export interface IPunch {
  Id: number;
  StationNumber: number;
  SICardNumber: number;
  Time: string;
}
export interface ITestPunch {
  Id: number;
  MsgId: number;
  Status: string;
  SINo: number;
  NoOfSendTries: number;
  SubscrId: number;
  RSSI: number;
  Time: string;
}
let demoPunchesIntervalID: NodeJS.Timeout | null;
let demoTestPunchesIntervalID: NodeJS.Timeout | null;
let demoPunches: IPunch[] = [];
let demoTestPunches: ITestPunch[] = [];
let demoTestPunchId: number = 1;

const chunkLengthToUse: number = 150; // MTU of 153 (3 byte header) should work on all phones hopefully
let propertyNotificationBufferReceived: Buffer = Buffer.from('');
let punchesNotificationBufferReceived: Buffer = Buffer.from('');
let testPunchesNotificationBufferReceived: Buffer = Buffer.from('');

export default function useBLE(): BluetoothLowEnergyApi {
  const apiService = 'fb880900-4ab2-40a2-a8f0-14cc1c2e5608';
  const propertyCharacteristic = 'fb880912-4ab2-40a2-a8f0-14cc1c2e5608';
  const punchesCharacteristic = 'fb880901-4ab2-40a2-a8f0-14cc1c2e5608'; //N: subscribe to punches
  const testPunchesCharacteristic = 'fb880907-4ab2-40a2-a8f0-14cc1c2e5608'; //N,R,W: test sending punches, subscribe, periodic

  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<
    Device | IDemoDevice | null
  >(null);
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
        console.log('startDeviceScan: ' + error);
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

  const encodeStringToBase64 = (value: string) => {
    console.log(
      'encodeStringToBase64: ' +
        value +
        ' base64: ' +
        Buffer.from(value).toString('base64'),
    );
    return Buffer.from(value).toString('base64');
  };

  const propertyNotify2 = (propName: string, propValue: string) => {
    // Find all subscribers and call them
    for (const propNotificationSub of propertyNotificationSubscriptions) {
      if (propNotificationSub.propName === propName) {
        console.log(
          'propertyNotify2: Found sub to notify: ' +
            propNotificationSub.componentRequesting +
            ' propName: ' +
            propNotificationSub.propName,
        );
        propNotificationSub.callback(propName, propValue);
      }
    }
  };

  const propertyNotify = (
    error: BleError | null,
    characteristic: Characteristic | null,
  ): void => {
    if (error !== null) {
      if (!(isDisconnecting && error.message === 'Operation was cancelled')) {
        console.log('propertyNotify: Notify error ' + error.name);
        console.log('propertyNotify: Notify error ' + error);
      }
    } else if (characteristic !== null && characteristic.value !== null) {
      let bufferOfReceivedNow = Buffer.from(characteristic.value, 'base64');
      propertyNotificationBufferReceived = Buffer.concat([
        propertyNotificationBufferReceived,
        bufferOfReceivedNow,
      ]);

      // we need to check the byte length and not the string length ( ¤ takes two bytes )
      let propAndValueStrings = '';
      if (bufferOfReceivedNow.length < chunkLengthToUse) {
        propAndValueStrings =
          propertyNotificationBufferReceived.toString('utf-8');
        propertyNotificationBufferReceived = Buffer.from('');
      } else {
        // This is not the full value, wait for the next fragment
        return;
      }
      console.log('propertyNotify: ' + propAndValueStrings);
      propAndValueStrings = propAndValueStrings.trimEnd();
      let propAndValuesArray = propAndValueStrings.split('|');
      for (const propAndValue of propAndValuesArray) {
        let propAndValueArray = propAndValue.split('\t', 2);
        let propName = propAndValueArray[0];
        let propValue = propAndValueArray[1];
        console.log('propertyNotify: propName: ' + propName);
        console.log('propertyNotify: propValue: ' + propValue);
        // Find all subscribers and call them
        propertyNotify2(propName, propValue);
      }
    }
  };

  const enablePropertyNotification = (device: Device) => {
    try {
      propertySubscription = device.monitorCharacteristicForService(
        apiService,
        propertyCharacteristic,
        propertyNotify,
        'propertyNotificationTransaction' + device.id,
      );
    } catch (e) {
      console.log('exception enablePropertyNotification: ' + e);
    }
    console.log('enablepropertyNotification');
  };

  const connectToDevice = async (device: Device | IDemoDevice) => {
    try {
      if (connectedDevice !== null && device.id === connectedDevice.id) {
        console.log('Already connected to this device');
        return;
      } else {
        console.log('connectToDevice: Connecting to: ' + device.name);
      }
      if (instanceOfIDemoDevice(device)) {
        console.log('connectToDevice: DEMO DEVICE!!');
        device.isConnected = true;
        setConnectedDevice(device);
      } else {
        let deviceConnected = await bleManager.connectToDevice(device.id, {
          requestMTU: chunkLengthToUse + 3,
        });
        console.log('is connected: ' + (await deviceConnected.isConnected()));
        console.log('MTU: ' + deviceConnected.mtu);
        await deviceConnected.discoverAllServicesAndCharacteristics();
        console.log('connectToDevice: discoverAllServicesAndCharacteristics');
        enablePropertyNotification(device);
        console.log('connectToDevice: enablePropertyNotification');
        setConnectedDevice(deviceConnected);
        console.log('connectToDevice: setConnectedDevice');
        requestProperty(
          deviceConnected,
          'useBLE',
          'all\t' + chunkLengthToUse,
          (propName: string, propValue: string) => {
            console.log(
              'connectToDevice: propName: ' +
                propName +
                ' propValue: ' +
                propValue,
            );
          },
        );
        //bleManager.stopDeviceScan();
      }
    } catch (e) {
      console.log('ERROR IN CONNECTION: ' + e);
    }
  };

  const disconnectDevice = async (device: Device | IDemoDevice) => {
    try {
      console.log('disconnectDevice: ' + device.id);
      setIsDisconnecting(true);
      let deviceToDisconnect = device === null ? connectedDevice : device;
      if (deviceToDisconnect === null) {
        console.log('disconnectDevice: Not connected to a device');
        return;
      }
      if (instanceOfIDemoDevice(deviceToDisconnect)) {
        console.log('disconnectDevice: DEMO DEVICE!!');
        if (deviceToDisconnect.id === connectedDevice?.id) {
          deviceToDisconnect.isConnected = false;
          setConnectedDevice(null);
        }
      } else {
        console.log('disconnectDevice 1');
        if (propertySubscription) {
          console.log('disconnectDevice: removing propertySubscription');
          propertySubscription.remove();
          propertySubscription = null;
        }
        if (punchesSubscription) {
          console.log('disconnectDevice: removing punchesSubscription');
          punchesSubscription.remove();
          punchesSubscription = null;
        }
        if (testPunchesSubscription) {
          console.log('disconnectDevice: removing testPunchesSubscription');
          testPunchesSubscription.remove();
          testPunchesSubscription = null;
        }
        console.log('disconnectDevice 1.1');
        bleManager.cancelTransaction(
          'propertyNotificationTransaction' + device.id,
        );
        console.log('disconnectDevice 1.2');
        bleManager.cancelTransaction(
          'punchesNotificationTransaction' + device.id,
        );
        console.log('disconnectDevice 1.3');
        bleManager.cancelTransaction(
          'testPunchesNotificationTransaction' + device.id,
        );
        console.log('disconnectDevice 2');
        await deviceToDisconnect.cancelConnection();
        console.log('disconnectDevice 3');
        if (deviceToDisconnect.id === connectedDevice?.id) {
          setConnectedDevice(null);
        }
        console.log('disconnectDevice 4');
        setIsDisconnecting(false);
      }
    } catch (e) {
      setConnectedDevice(null);
      setIsDisconnecting(false);
      console.log('ERROR IN DISCONNECTION: ' + e);
    }
  };

  const sendPropertyValueToDemoDevice = (propName: string): void => {
    let propValue = demoDeviceData[propName];
    propertyNotify2(propName, propValue);
  };

  const addOrUpdatePropertyNotifiticationSubscription = (
    newSub: IPropNotificationSubscriber,
  ) => {
    let foundSub = propertyNotificationSubscriptions.find(
      (sub: IPropNotificationSubscriber) => {
        return (
          sub.componentRequesting === newSub.componentRequesting &&
          sub.propName === newSub.propName
        );
      },
    );
    if (foundSub) {
      foundSub.callback = newSub.callback;
    } else {
      propertyNotificationSubscriptions.push(newSub);
    }
  };

  const requestProperty = async (
    device: Device | IDemoDevice,
    componentRequesting: string,
    propName: string,
    callback: callbackFn,
  ): Promise<Characteristic | null> => {
    try {
      console.log('requestProperty: deviceName: ' + device.name);
      console.log('requestProperty: ' + propName);
      addOrUpdatePropertyNotifiticationSubscription({
        componentRequesting: componentRequesting,
        propName: propName,
        callback: callback,
      });
      if (instanceOfIDemoDevice(device)) {
        sendPropertyValueToDemoDevice(propName);
        return null; // maybe should return someting else?
      } else {
        let propNameToSend = propName + '|';
        if (Buffer.from(propNameToSend, 'utf-8').length === chunkLengthToUse) {
          propNameToSend += ' ';
        }
        let characteristic =
          await device.writeCharacteristicWithResponseForService(
            apiService,
            propertyCharacteristic,
            encodeStringToBase64(propNameToSend),
          );
        console.log('requestProperty 3');
        return characteristic;
      }
    } catch (e) {
      console.log('ERROR IN requestProperty: ' + e);
      return null;
    }
  };

  const saveProperty = async (
    device: Device | IDemoDevice,
    propName: string,
    propValue: string,
  ): Promise<Characteristic | null> => {
    try {
      console.log('saveProperty:deviceName: ' + device.name);
      console.log('saveProperty:propName: ' + propName);
      console.log('saveProperty:propValue: ' + propValue);
      if (instanceOfIDemoDevice(device)) {
        demoDeviceData[propName] = propValue;
        return null;
      } else {
        var propNameAndPropValue = propName + '\t' + propValue;
        let characteristic =
          await device.writeCharacteristicWithResponseForService(
            apiService,
            propertyCharacteristic,
            encodeStringToBase64(propNameAndPropValue),
          );
        console.log('saveproperty 2');
        return characteristic;
      }
    } catch (e) {
      console.log('ERROR IN saveProperty: ' + e);
      return null;
    }
  };

  const punchesNotify = (
    error: BleError | null,
    characteristic: Characteristic | null,
  ): void => {
    if (error !== null) {
      if (!(isDisconnecting && error.message === 'Operation was cancelled')) {
        console.log('punchesNotify: Notify error ' + error.name);
        console.log('punchesNotify: Notify error ' + error.message);
      }
    } else if (characteristic !== null && characteristic.value !== null) {
      let bufferOfReceivedNow = Buffer.from(characteristic.value, 'base64');
      punchesNotificationBufferReceived = Buffer.concat([
        punchesNotificationBufferReceived,
        bufferOfReceivedNow,
      ]);
      // we need to check the byte length and not the string length ( ¤ takes two bytes )
      let punchesString = '';
      if (bufferOfReceivedNow.length < chunkLengthToUse) {
        punchesString = punchesNotificationBufferReceived.toString('utf-8');
        punchesNotificationBufferReceived = Buffer.from('');
      } else {
        // This is not the full value, wait for the next fragment
        return;
      }
      punchesCallbackFunction('punches', punchesString);
    }
  };

  const sendDemoPunches = (callback: callbackFn) => {
    let interval = Math.floor(Math.random() * 8000);
    console.log('useBLE:sendDemoPunches interval ' + interval);
    demoPunchesIntervalID = setInterval(() => {
      console.log('useBLE:sendDemoPunches triggered ');
      demoPunches.push({
        Id: -1,
        StationNumber: 100 + Math.floor(Math.random() * 5),
        SICardNumber: 10000 + Math.floor(Math.random() * 1000000),
        Time: new Date().toTimeString().split(' ')[0],
      });
      callback('punches', JSON.stringify({punches: demoPunches}));
    }, interval);
  };

  const enablePunchesNotification = (
    device: Device | IDemoDevice,
    callback: callbackFn,
  ) => {
    try {
      if (instanceOfIDemoDevice(device)) {
        console.log('useBLE:enablePunchesNotification');
        sendDemoPunches(callback);
        return null;
      } else {
        punchesCallbackFunction = callback;
        punchesSubscription = device.monitorCharacteristicForService(
          apiService,
          punchesCharacteristic,
          punchesNotify,
          'punchesNotificationTransaction' + device.id,
        );
      }
    } catch (e) {
      console.log('exception enablePunchesNotification: ' + e);
    }
    console.log('enablePunchesNotification');
  };

  const disablePunchesNotification = (device: Device | IDemoDevice) => {
    try {
      if (instanceOfIDemoDevice(device)) {
        if (demoPunchesIntervalID) {
          clearInterval(demoPunchesIntervalID);
          demoPunchesIntervalID = null;
        }
        return null;
      } else {
        bleManager.cancelTransaction(
          'punchesNotificationTransaction' + device.id,
        );
        if (punchesSubscription) {
          console.log(
            'disablePunchesNotification: removing punchesSubscription',
          );
          punchesSubscription.remove();
          punchesSubscription = null;
        }
        console.log('setting isdisconnectingpunches to false');
      }
    } catch (e) {
      console.log('exception enablePunchesNotification: ' + e);
    }
    console.log('enablePunchesNotification');
  };

  const testPunchesNotify = (
    error: BleError | null,
    characteristic: Characteristic | null,
  ): void => {
    if (error !== null) {
      console.log('testPunchesNotify: Notify error ' + error.name);
      console.log('testPunchesNotify: Notify error ' + error);
    } else if (characteristic !== null && characteristic.value !== null) {
      let bufferOfReceivedNow = Buffer.from(characteristic.value, 'base64');
      console.log('useBLE:testPunchesNotify received: ' + bufferOfReceivedNow);
      testPunchesNotificationBufferReceived = Buffer.concat([
        testPunchesNotificationBufferReceived,
        bufferOfReceivedNow,
      ]);
      // we need to check the byte length and not the string length ( ¤ takes two bytes )
      let punchesString = '';
      if (bufferOfReceivedNow.length < chunkLengthToUse) {
        console.log(
          'useBLE:testPunchesNotify bufferOfReceivedNow.length ' +
            bufferOfReceivedNow.length +
            ' chunkLengthToUse' +
            chunkLengthToUse,
        );
        punchesString = testPunchesNotificationBufferReceived.toString('utf-8');
        testPunchesNotificationBufferReceived = Buffer.from('');
      } else {
        // This is not the full value, wait for the next fragment
        return;
      }
      testPunchesCallbackFunction('testpunches', punchesString);
    }
  };

  const sendDemoTestPunch = (
    noOfPunches: number,
    siCardNo: number,
    callback: callbackFn,
  ) => {
    console.log('useBLE:sendDemoTestPunches triggered ');
    if (demoTestPunchId > noOfPunches && connectedDevice) {
      disableTestPunchesNotification(connectedDevice);
      return;
    }
    demoTestPunches.push({
      Id: demoTestPunchId,
      MsgId: -1,
      Status: 'Acked',
      SINo: siCardNo,
      NoOfSendTries: 1,
      SubscrId: 1,
      RSSI: 140,
      Time: new Date().toTimeString().split(' ')[0],
    });
    demoTestPunchId++;
    callback('testpunches', JSON.stringify({punches: demoTestPunches}));
  };

  const sendDemoTestPunches = (callback: callbackFn) => {
    let testPunchParam = demoDeviceData['testpunches'];
    let testPunchParamArray = testPunchParam.split('\t');
    let noOfPunches = parseInt(testPunchParamArray[0], 10);
    let interval = parseInt(testPunchParamArray[1], 10);
    let siCardNo = parseInt(testPunchParamArray[2], 10);
    console.log('useBLE:sendDemoTestPunches interval ' + interval);

    // Send first punch immediately
    sendDemoTestPunch(noOfPunches, siCardNo, callback);

    demoTestPunchesIntervalID = setInterval(() => {
      sendDemoTestPunch(noOfPunches, siCardNo, callback);
    }, interval);
  };

  const enableTestPunchesNotification = (
    device: Device | IDemoDevice,
    callback: callbackFn,
  ) => {
    try {
      console.log('enableTestPunchesNotification');
      if (instanceOfIDemoDevice(device)) {
        demoTestPunches = [];
        demoTestPunchId = 1;
        sendDemoTestPunches(callback);
        return null;
      } else {
        testPunchesCallbackFunction = callback;
        testPunchesSubscription = device.monitorCharacteristicForService(
          apiService,
          testPunchesCharacteristic,
          testPunchesNotify,
          'testPunchesNotificationTransaction' + device.id,
        );
      }
    } catch (e) {
      console.log('exception enableTestPunchesNotification: ' + e);
    }
    console.log('enableTestPunchesNotification');
  };

  const disableTestPunchesNotification = (device: Device | IDemoDevice) => {
    try {
      console.log('disableTestPunchesNotification');
      if (instanceOfIDemoDevice(device)) {
        if (demoTestPunchesIntervalID) {
          clearInterval(demoTestPunchesIntervalID);
          demoTestPunchesIntervalID = null;
        }
        return null;
      } else {
        bleManager.cancelTransaction(
          'testPunchesNotificationTransaction' + device.id,
        );
        if (testPunchesSubscription) {
          console.log(
            'disableTestPunchesNotification: removing testPunchesSubscription',
          );
          testPunchesSubscription.remove();
          testPunchesSubscription = null;
        }
      }
    } catch (e) {
      console.log('exception enablePunchesNotification: ' + e);
    }
    console.log('enablePunchesNotification');
  };

  const startSendTestPunches = async (
    device: Device | IDemoDevice,
    propName: string,
    propValue: string,
  ): Promise<Characteristic | null> => {
    try {
      console.log('startSendTestPUnches:deviceName: ' + device.name);
      console.log('startSendTestPUnches:propName: ' + propName);
      console.log('startSendTestPUnches:propValue: ' + propValue);
      if (instanceOfIDemoDevice(device)) {
        demoDeviceData[propName] = propValue;
        return null;
      } else {
        let characteristic =
          await device.writeCharacteristicWithResponseForService(
            apiService,
            testPunchesCharacteristic,
            encodeStringToBase64(propValue),
          );
        console.log('startSendTestPUnches 2');
        return characteristic;
      }
    } catch (e) {
      console.log('ERROR IN startSendTestPUnches: ' + e);
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
    enablePunchesNotification,
    disablePunchesNotification,
    enableTestPunchesNotification,
    disableTestPunchesNotification,
    startSendTestPunches,
  };
}
