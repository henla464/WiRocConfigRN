import {
  BleError,
  BleErrorCode,
  BleManager,
  Device,
  Subscription,
} from 'react-native-ble-plx';

import {GettablePropName, SettablePropName} from '@api/transformers';
import {log} from '@lib/log';

import {chunkLengthToUse, createBleChunkHelper} from './bleChunkHelper';
import {requestBlePermissions} from './blePermissions';

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
  const onDeviceDisconnectedSubscribers = new Set<
    (device: Device, wasExpected: boolean) => void
  >();

  const blePropertyBuffer = createBleChunkHelper();
  const blePunchesBuffer = createBleChunkHelper();
  const bleTestPunchesBuffer = createBleChunkHelper();

  const punchesSubscription: Record<string, Subscription> = {};
  const testPunchesSubscription: Record<string, Subscription> = {};
  const isDisconnecting: Record<string, boolean> = {};

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
      (err, characteristic) => {
        if (
          err instanceof Error &&
          (err.errorCode === BleErrorCode.OperationCancelled ||
            err.errorCode === BleErrorCode.DeviceDisconnected)
        ) {
          return;
        }
        if (err) {
          throw err;
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
            (err.errorCode === BleErrorCode.OperationCancelled ||
              err.errorCode === BleErrorCode.DeviceDisconnected)
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
        (err, characteristic) => {
          if (
            err instanceof Error &&
            (err.errorCode === BleErrorCode.OperationCancelled ||
              err.errorCode === BleErrorCode.DeviceDisconnected)
          ) {
            return;
          }
          if (err) {
            throw err;
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
            (err.errorCode === BleErrorCode.OperationCancelled ||
              err.errorCode === BleErrorCode.DeviceDisconnected)
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
    return new Promise<void>(async (resolve, reject) => {
      log.debug('Connecting to', deviceId);

      if (await bleManager.isDeviceConnected(deviceId)) {
        log.debug('Already connected');
        return;
      }

      log.debug('Checking if we know it already...');
      const [foundDevice] = await bleManager.devices([deviceId]);
      if (!foundDevice) {
        log.debug('Device not scanned. Will try to scan for it...');
        log.debug('Checking permissions...');
        const granted = await requestBlePermissions();
        if (!granted) {
          log.debug('Permissions not granted');
          return;
        }
        log.debug('Permissions granted');
        const timeout = setTimeout(() => {
          log.debug('Stopping scan...');
          bleManager.stopDeviceScan();
          // setWiRocConnection(deviceId, state => (state.status = 'disconnected'));
          clearTimeout(timeout);
          reject(new Error('Device not found'));
        }, 7e3);
        await new Promise<void>(resolveScan => {
          bleManager.startDeviceScan(
            [apiService],
            null,
            async (err, scannedDevice) => {
              if (err) {
                log.error('Error while scanning for device', err);
                clearTimeout(timeout);
                reject(err);
              } else if (scannedDevice?.id === deviceId) {
                log.debug('Found device', deviceId);
                bleManager.stopDeviceScan();
                clearTimeout(timeout);
                resolveScan();
              }
              // TODO update devices we find here
            },
          );
        });
      }

      log.debug('Connecting to scanned device...');
      await bleManager.connectToDevice(deviceId);
      log.debug('Connected to device', deviceId);
      await bleManager.discoverAllServicesAndCharacteristicsForDevice(deviceId);
      bleManager.monitorCharacteristicForDevice(
        deviceId,
        apiService,
        propertyCharacteristic,
        (err, characteristic) => {
          if (
            err instanceof Error &&
            (err.errorCode === BleErrorCode.OperationCancelled ||
              err.errorCode === BleErrorCode.DeviceDisconnected)
          ) {
            return;
          }
          if (err) {
            throw err;
          }
          blePropertyBuffer.provideChunk(deviceId, characteristic?.value);
        },
        `propertyNotificationTransaction${deviceId}`,
      );

      log.debug('Setting chunk size...');
      // The main purpose of this command is to set chunk size to use.
      //
      // But the response of this request will also contain a bunch of
      // properties (which we can use to initialize the Query cache).
      await sendData(
        deviceId,
        propertyCharacteristic,
        `all\t${chunkLengthToUse}`,
      );
      log.debug('Setting chunk size done.');

      const [device] = await bleManager.devices([deviceId]);

      log.debug('Emitting onDeviceConnected...');

      onDeviceConnectedSubscribers.forEach(subscriber => subscriber(device));

      const sub = bleManager.onDeviceDisconnected(deviceId, () => {
        sub.remove();
        const wasExpected = isDisconnecting[deviceId];
        isDisconnecting[deviceId] = false;

        onDeviceDisconnectedSubscribers.forEach(subscriber =>
          subscriber(device, wasExpected),
        );

        if (!wasExpected) {
          cancelTransactions(deviceId);
        }
      });

      log.debug('connectToDevice done');
      resolve();
    });
  };

  const cancelTransactions = (deviceId: string) => {
    try {
      bleManager.cancelTransaction(
        `propertyNotificationTransaction${deviceId}`,
      );
      bleManager.cancelTransaction(`punchesNotificationTransaction${deviceId}`);
      bleManager.cancelTransaction(
        `testPunchesNotificationTransaction${deviceId}`,
      );
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
  };

  const disconnectFromDevice = async (deviceId: string) => {
    try {
      cancelTransactions(deviceId);
      isDisconnecting[deviceId] = true;
      await bleManager.cancelDeviceConnection(deviceId);
    } catch (err) {
      if (
        !(
          err instanceof BleError &&
          err.errorCode === BleErrorCode.DeviceDisconnected
        )
      ) {
        isDisconnecting[deviceId] = false;
        throw err;
      }
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
    log.debug('writeProperty', deviceId, key, value.replace(/\t/g, '\\t'));
    return sendData(deviceId, propertyCharacteristic, `${key}\t${value}`);
  };

  const requestProperty = async (
    deviceId: string,
    key: GettablePropName,
  ): Promise<string> => {
    log.debug('requestProperty', deviceId, key);
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
    log.debug('requestProperties', deviceId, keys);
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
    log.debug('sendData', deviceId, data);
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
        log.debug('parsed response', parsedData);
        resolve(parsedData);
      };
      blePropertyBuffer.subscribe(onData);
    });
  };

  const onPropertiesChanged = (callback: PropertiesChangedCallback) => {
    const bufferSubscription = blePropertyBuffer.subscribe((deviceId, data) => {
      log.debug('onPropertiesChanged', deviceId, data);
      callback(deviceId, parseWiRocBleProps(data));
    });
    return () => {
      // cancel subscription
      bufferSubscription();
    };
  };

  const onPunchesRecieved = (callback: PunchRecievedCallback) => {
    const bufferSubscription = blePunchesBuffer.subscribe((deviceId, data) => {
      log.debug('onPunchRecieved', deviceId, data, typeof data);
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
        log.debug('onTestPunchSent', deviceId, data, typeof data);
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
    log.debug('startSendTestPunches', deviceId, params);
    const data = await sendData(
      deviceId,
      testPunchesCharacteristic,
      `${params.numberOfPunches}\t${params.sendInterval}\t${params.siCardNo}`,
    );
    log.debug('startSendTestPunches response', data);
  };

  const onDeviceConnected = (callback: (device: Device) => void) => {
    onDeviceConnectedSubscribers.add(callback);
    return () => {
      onDeviceConnectedSubscribers.delete(callback);
    };
  };

  const onDeviceDisconnected = (
    callback: (device: Device, wasExpected: boolean) => void,
  ) => {
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
  'wirocbleapiversion',
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
    const firstTab = propertyResponse.indexOf('\t');
    if (firstTab === -1) {
      log.warn(`Invalid BLE property format: ${propertyResponse}`);
      continue;
    }
    const propName = propertyResponse.slice(0, firstTab);
    const propValue = propertyResponse.slice(firstTab + 1);

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

  const data: Partial<Record<GettablePropName, string>> = {};
  for (const [index] of allPropertiesOrder.entries()) {
    if (index >= allPropertiesOrder.length) {
      log.warn(
        `Unkown property in "all" response at index ${index}: ${all[index]}`,
      );
      continue;
    }
    data[allPropertiesOrder[index] as GettablePropName] = all[index];
  }

  return data;
}
