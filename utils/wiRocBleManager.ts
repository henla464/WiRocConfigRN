import {
  BleError,
  BleErrorCode,
  BleManager,
  Device,
  Subscription,
} from 'react-native-ble-plx';
import {GettablePropName, SettablePropName} from '../api/transformers';
import {chunkLengthToUse, createBleChunkHelper} from './bleChunkHelper';

const apiService = 'fb880900-4ab2-40a2-a8f0-14cc1c2e5608';
const propertyCharacteristic = 'fb880912-4ab2-40a2-a8f0-14cc1c2e5608';
const punchesCharacteristic = 'fb880901-4ab2-40a2-a8f0-14cc1c2e5608'; //N: subscribe to punches
const testPunchesCharacteristic = 'fb880907-4ab2-40a2-a8f0-14cc1c2e5608'; //N,R,W: test sending punches, subscribe, periodic

export const bleManager = new BleManager();

export type WiRocBleManager = ReturnType<typeof createWiRocBleManager>;

type PropertiesChangedCallback = (
  deviceId: string,
  data: Partial<Record<GettablePropName, string>>,
) => void;

type PunchRecievedCallback = (
  deviceId: string,
  data: {
    punches: Array<{
      SICardNumber: number;
      StationNumber: number;
      Time: string;
    }>;
  },
) => void;

type TestPunchSentCallback = (
  deviceId: string,
  data: {
    punches: Array<{
      Id: number;
      MsgId: number;
      Status: string;
      SINo: number;
      NoOfSendTries: number;
      SubscrId: number;
      RSSI: number;
      Time: string;
    }>;
  },
) => void;

export const createWiRocBleManager = () => {
  const onDeviceConnectedSubscribers = new Set<(device: Device) => void>();
  const onDeviceDisconnectedSubscribers = new Set<(device: Device) => void>();

  const blePropertyBuffer = createBleChunkHelper();
  const blePunchesBuffer = createBleChunkHelper();
  const bleTestPunchesBuffer = createBleChunkHelper();

  const punchesSubscription: Record<string, Subscription> = {};
  const testPunchesSubscription: Record<string, Subscription> = {};

  const startDeviceScan = (callback: (device: Device) => void) => {
    bleManager.startDeviceScan([apiService], null, async (error, device) => {
      if (error) {
        throw error;
      }
      if (device) {
        callback(device);
      }
    });
  };

  const stopDeviceScan = () => {
    return bleManager.stopDeviceScan();
  };

  const enablePunchesNotification = async (deviceId: string) => {
    if (punchesSubscription[deviceId]) {
      // already subscribed
      return;
    }
    punchesSubscription[deviceId] = bleManager.monitorCharacteristicForDevice(
      deviceId,
      apiService,
      punchesCharacteristic,
      (error, characteristic) => {
        if (
          error instanceof Error &&
          error.errorCode === BleErrorCode.OperationCancelled
        ) {
          return;
        }
        if (error) {
          throw error;
        }
        blePunchesBuffer.provideChunk(deviceId, characteristic?.value);
      },
      `punchesNotificationTransaction${deviceId}`,
    );
  };

  const disablePunchesNotification = async (deviceId: string) => {
    if (punchesSubscription[deviceId]) {
      bleManager.cancelTransaction(`punchesNotificationTransaction${deviceId}`);
      try {
        punchesSubscription[deviceId].remove();
      } catch (err) {
        if (
          !(
            err instanceof BleError &&
            err.errorCode === BleErrorCode.OperationCancelled
          )
        ) {
          // OperationCancelled seems to be expected
          // https://dotintent.github.io/react-native-ble-plx/#blemanagercanceltransaction
          throw err;
        }
      }
      delete punchesSubscription[deviceId];
    }
  };

  const isTestPunchesNotificationEnabled = async (deviceId: string) => {
    return !!testPunchesSubscription[deviceId];
  };

  const enableTestPunchesNotification = async (deviceId: string) => {
    if (testPunchesSubscription[deviceId]) {
      // already subscribed
      return;
    }
    testPunchesSubscription[deviceId] =
      bleManager.monitorCharacteristicForDevice(
        deviceId,
        apiService,
        testPunchesCharacteristic,
        (error, characteristic) => {
          if (
            error instanceof Error &&
            error.errorCode === BleErrorCode.OperationCancelled
          ) {
            return;
          }
          if (error) {
            throw error;
          }
          bleTestPunchesBuffer.provideChunk(deviceId, characteristic?.value);
        },
        `testPunchesNotificationTransaction${deviceId}`,
      );
  };

  const disableTestPunchesNotification = async (deviceId: string) => {
    if (testPunchesSubscription[deviceId]) {
      bleManager.cancelTransaction(
        `testPunchesNotificationTransaction${deviceId}`,
      );
      try {
        testPunchesSubscription[deviceId].remove();
      } catch (err) {
        if (
          !(
            err instanceof BleError &&
            err.errorCode === BleErrorCode.OperationCancelled
          )
        ) {
          // OperationCancelled seems to be expected
          // https://dotintent.github.io/react-native-ble-plx/#blemanagercanceltransaction
          throw err;
        }
      }
      delete testPunchesSubscription[deviceId];
    }
  };

  const isPunchesNotificationEnabled = async (deviceId: string) => {
    return !!punchesSubscription[deviceId];
  };

  const connectToDevice = async (deviceId: string) => {
    console.log('[wiRocBleManager] Connecting to', deviceId);
    console.log('[wiRocBleManager] Checking if we know it already...');
    const [foundDevice] = await bleManager.devices([deviceId]);
    if (!foundDevice) {
      console.log(
        '[wiRocBleManager] Device not scanned. Will try to scan for it...',
      );
      const timeout = setTimeout(() => {
        console.log('[wiRocBleManager] Stopping scan...');
        bleManager.stopDeviceScan();
        // setWiRocConnection(deviceId, state => (state.status = 'disconnected'));
        clearTimeout(timeout);
        throw new Error('Device not found');
      }, 7e3);
      await new Promise<void>(resolve => {
        bleManager.startDeviceScan(
          [apiService],
          null,
          async (err, scannedDevice) => {
            if (err) {
              console.error('Error while scanning for device', err);
            } else if (scannedDevice?.id === deviceId) {
              console.log('[wiRocBleManager] Found device', deviceId);
              bleManager.stopDeviceScan();
              clearTimeout(timeout);
              resolve();
            }
            // TODO update devices we find here
          },
        );
      });
    }

    console.log('[wiRocBleManager] Connecting to scanned device...');
    await bleManager.connectToDevice(deviceId);
    await bleManager.discoverAllServicesAndCharacteristicsForDevice(deviceId);
    bleManager.monitorCharacteristicForDevice(
      deviceId,
      apiService,
      propertyCharacteristic,
      (error, characteristic) => {
        if (
          error instanceof Error &&
          error.errorCode === BleErrorCode.OperationCancelled
        ) {
          return;
        }
        if (error) {
          throw error;
        }
        blePropertyBuffer.provideChunk(deviceId, characteristic?.value);
      },
      `propertyNotificationTransaction${deviceId}`,
    );

    // The main purpose of this command is to set chunk size to use.
    //
    // But the response of this request will also contain a bunch of
    // properties (which we can use to initialize the Query cache).
    await sendData(
      deviceId,
      propertyCharacteristic,
      `all\t${chunkLengthToUse}`,
    );

    const [device] = await bleManager.devices([deviceId]);
    onDeviceConnectedSubscribers.forEach(subscriber => subscriber(device));

    // TODO is this automatically called when device disconnects?
    bleManager.onDeviceDisconnected(deviceId, () => {
      onDeviceDisconnectedSubscribers.forEach(subscriber => subscriber(device));
    });
  };

  const disconnectFromDevice = async (deviceId: string) => {
    try {
      bleManager.cancelTransaction(
        `propertyNotificationTransaction${deviceId}`,
      );
      bleManager.cancelTransaction(`punchesNotificationTransaction${deviceId}`);
      bleManager.cancelTransaction(
        `testPunchesNotificationTransaction${deviceId}`,
      );
      await bleManager.cancelDeviceConnection(deviceId);
    } catch (err) {
      if (
        !(
          err instanceof BleError &&
          err.errorCode === BleErrorCode.OperationCancelled
        )
      ) {
        // OperationCancelled seems to be expected
        // https://dotintent.github.io/react-native-ble-plx/#blemanagercanceltransaction
        throw err;
      }
      throw err;
    }
  };

  const isDeviceConnected = async (deviceId: string) => {
    return bleManager.isDeviceConnected(deviceId);
  };

  const writeProperty = async (
    deviceId: string,
    key: SettablePropName,
    value: string,
  ) => {
    console.log('[BLE] writeProperty', deviceId, key, value);
    return sendData(deviceId, propertyCharacteristic, `${key}\t${value}`);
  };

  const requestProperty = async (
    deviceId: string,
    key: GettablePropName,
  ): Promise<string> => {
    console.log('[BLE] requestProperty', deviceId, key);
    const data = await requestProperties(deviceId, [key]);
    const value = data[key];
    if (!value) {
      throw new Error('Property not found: ' + key);
    }
    return value;
  };

  const requestProperties = async (
    deviceId: string,
    keys: GettablePropName[],
  ) => {
    console.log('[BLE] requestProperties', deviceId, keys);
    let propNameToSend = keys.join('|') + '|';
    if (Buffer.from(propNameToSend, 'utf-8').length === chunkLengthToUse) {
      propNameToSend += ' ';
    }
    return sendData(deviceId, propertyCharacteristic, propNameToSend);
  };

  const sendData = async (
    deviceId: string,
    characteristic: string,
    data: string,
  ) => {
    console.log('[BLE] sendData', deviceId, data);
    await bleManager.writeCharacteristicWithResponseForDevice(
      deviceId,
      apiService,
      characteristic,
      Buffer.from(data).toString('base64'),
    );

    // TODO add timeout to this and throw error?
    return new Promise<Partial<Record<GettablePropName, string>>>(resolve => {
      const onData = (_deviceId: string, responseString: string) => {
        blePropertyBuffer.unsubscribe(onData);
        const parsedData = parseWiRocBleProps(responseString);
        console.log('[BLE] parsed response', parsedData);
        resolve(parsedData);
      };
      blePropertyBuffer.subscribe(onData);
    });
  };

  const onPropertiesChanged = (callback: PropertiesChangedCallback) => {
    const bufferSubscription = blePropertyBuffer.subscribe((deviceId, data) => {
      console.log('onPropertiesChanged', deviceId, data);
      callback(deviceId, parseWiRocBleProps(data));
    });
    return () => {
      // cancel subscription
      bufferSubscription();
    };
  };

  const onPunchesRecieved = (callback: PunchRecievedCallback) => {
    const bufferSubscription = blePunchesBuffer.subscribe((deviceId, data) => {
      console.log('onPunchRecieved', deviceId, data, typeof data);
      callback(deviceId, JSON.parse(data));
    });
    return () => {
      // cancel subscription
      bufferSubscription();
    };
  };

  const onTestPunchesSent = (callback: TestPunchSentCallback) => {
    const bufferSubscription = bleTestPunchesBuffer.subscribe(
      (deviceId, data) => {
        console.log('onTestPunchSent', deviceId, data, typeof data);
        callback(deviceId, JSON.parse(data));
      },
    );
    return () => {
      // cancel subscription
      bufferSubscription();
    };
  };

  const startSendTestPunches = async (
    deviceId: string,
    params: {numberOfPunches: number; sendInterval: number; siCardNo: string},
  ): Promise<void> => {
    console.log('[BLE] startSendTestPunches', deviceId, params);
    const data = await sendData(
      deviceId,
      testPunchesCharacteristic,
      `${params.numberOfPunches}\t${params.sendInterval}\t${params.siCardNo}`,
    );
    console.log('startSendTestPunches response', data);
  };

  const onDeviceConnected = (callback: (device: Device) => void) => {
    onDeviceConnectedSubscribers.add(callback);
    return () => {
      onDeviceConnectedSubscribers.delete(callback);
    };
  };

  const onDeviceDisconnected = (callback: (device: Device) => void) => {
    onDeviceDisconnectedSubscribers.add(callback);
    return () => {
      onDeviceDisconnectedSubscribers.delete(callback);
    };
  };

  return {
    startDeviceScan,
    stopDeviceScan,
    connectToDevice,
    isDeviceConnected,
    disconnectFromDevice,
    writeProperty,
    requestProperties,
    requestProperty,
    onPropertiesChanged,
    onDeviceConnected,
    onDeviceDisconnected,

    enablePunchesNotification,
    disablePunchesNotification,
    isPunchesNotificationEnabled,
    onPunchesRecieved,

    enableTestPunchesNotification,
    disableTestPunchesNotification,
    isTestPunchesNotificationEnabled,
    onTestPunchesSent,
    startSendTestPunches,
  };
};

const allPropertiesOrder: GettablePropName[] = [
  'ischarging',
  'wirocdevicename',
  'sendtosirapipport',
  'sendtosirapip',
  'sendtosirapenabled',
  'acknowledgementrequested',
  'datarate',
  'channel',
  'batterylevel',
  'ipaddress',
  'power',
  'loramodule',
  'lorarange',
  'wirocpythonversion',
  'wirocbleversion',
  'wirochwversion',
  'onewayreceive',
  'force4800baudrate',
  'loramode',
  'rxgainenabled',
  'coderate',
  'rs232mode',
  'rs232onewayreceive',
  'forcers2324800baudrate',
  'btserialonewayreceive',
  'forcebtserial4800baudrate',
];

const parseWiRocBleProps = (
  input: string,
): Partial<Record<GettablePropName, string>> => {
  const propertyResponses = input.split('|');

  const out: Partial<Record<GettablePropName, string>> = {};
  for (const propertyResponse of propertyResponses) {
    const [propName, propValue] = propertyResponse.split('\t');

    if (propName === 'all') {
      return allPropertiesToObject(propValue);
    } else {
      out[propName as GettablePropName] = propValue;
    }
  }

  return out;
};

function allPropertiesToObject(allString: string) {
  const all = allString.split('¤');
  console.log('all', all);

  const data: Partial<Record<GettablePropName, string>> = {};
  for (const [index] of allPropertiesOrder.entries()) {
    if (index >= allPropertiesOrder.length) {
      console.warn(
        `Unkown property in "all" response at index ${index}: ${all[index]}`,
      );
      continue;
    }
    data[allPropertiesOrder[index] as GettablePropName] = all[index];
  }

  console.log(JSON.stringify(data, null, 2));
  return data;
}