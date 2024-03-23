import {BluetoothDevice} from '..';
import demoDeviceData from '../../hooks/demoDeviceData.json';
import {GettablePropName} from '../transformers';
import {
  PropertiesChangedCallback,
  PunchesRecievedCallback,
  TestPunch,
  TestPunchesSentCallback,
  WiRocApiBackend,
} from '../types';

let testPunchId = 0;

export const createDemoApiBackend = (deviceName: string): WiRocApiBackend => {
  const demoData = {
    ...demoDeviceData,
  } as unknown as Record<GettablePropName, string>;
  demoData.wirocdevicename = deviceName;

  let watchingPunchesTimeout: ReturnType<typeof setTimeout> | null = null;

  let isWatchingTestPunches = false;

  const onPunchRecievedSubscribers = new Set<PunchesRecievedCallback>();
  const onPropertiesChangesSubscribers = new Set<PropertiesChangedCallback>();
  const onTestPunchesSentSubscribers = new Set<TestPunchesSentCallback>();

  return {
    async getProperty(propertyName: GettablePropName) {
      return demoData[propertyName];
    },
    async setProperty(propertyName, value) {
      const values = Array.isArray(value) ? value : [value];

      if (propertyName === 'settings') {
        const updated = [
          ...JSON.parse(demoData.settings).settings,
          {
            Key: values[0],
            Value: values[1],
          },
        ];
        demoData.settings = JSON.stringify(updated);
        return values.join('\t');
      }

      if (propertyName === 'rtc/wakeup') {
        demoData['rtc/wakeupenabled'] = '1';
        onPropertiesChangesSubscribers.forEach(callback => {
          callback({
            'rtc/wakeupenabled': '1',
          });
        });
      }

      if (propertyName === 'bindrfcomm') {
        const updated = JSON.parse(demoData.scanbtaddresses).map(
          (device: BluetoothDevice) => {
            if (device.BTAddress === values[0]) {
              return {
                ...device,
                Status: 'Connected',
              };
            }
            return device;
          },
        );
        demoData.scanbtaddresses = JSON.stringify(updated);
        return JSON.stringify({
          Value: updated,
        });
      }

      if (propertyName === 'releaserfcomm') {
        const updated = JSON.parse(demoData.scanbtaddresses).map(
          (device: BluetoothDevice) => {
            if (device.BTAddress === values[0]) {
              return {
                ...device,
                Status: 'NotConnected',
              };
            }
            return device;
          },
        );
        demoData.scanbtaddresses = JSON.stringify(updated);
        return JSON.stringify({
          Value: updated,
        });
      }

      if (propertyName === 'upgradewirocpython') {
        demoData.wirocpythonversion = values[0];
        onPropertiesChangesSubscribers.forEach(callback => {
          callback({
            wirocpythonversion: values[0],
          });
        });
        return 'OK';
      }

      if (propertyName === 'upgradewirocble') {
        demoData.wirocbleapiversion = values[0];
        onPropertiesChangesSubscribers.forEach(callback => {
          callback({
            wirocbleapiversion: values[0],
          });
        });
        return 'OK';
      }

      // TODO some properties are not really settable, hence the TS error
      // @ts-expect-error
      demoData[propertyName] = values[0];

      return values[0];
    },

    onPropertiesChanges(callback) {
      onPropertiesChangesSubscribers.add(callback);
      return () => {
        onPropertiesChangesSubscribers.delete(callback);
      };
    },

    onPunchesRecieved(callback) {
      onPunchRecievedSubscribers.add(callback);
      return () => {
        onPunchRecievedSubscribers.delete(callback);
      };
    },

    onTestPunchesSent(callback) {
      onTestPunchesSentSubscribers.add(callback);
      return () => {
        onTestPunchesSentSubscribers.delete(callback);
      };
    },

    startWatchingPunches() {
      if (watchingPunchesTimeout) {
        return;
      }

      const send = () => {
        onPunchRecievedSubscribers.forEach(callback => {
          callback([
            {
              SICardNumber: 123456,
              StationNumber: 1,
              Time: new Date().toISOString(),
            },
          ]);
        });

        watchingPunchesTimeout = setTimeout(send, 5000);
      };

      send();
    },

    stopWatchingPunches() {
      if (watchingPunchesTimeout) {
        clearTimeout(watchingPunchesTimeout);
        watchingPunchesTimeout = null;
      }
    },

    startWatchingTestPunches() {
      isWatchingTestPunches = true;
    },

    stopWatchingTestPunches() {
      isWatchingTestPunches = false;
    },

    startSendingTestPunches(options) {
      let punchesLeft = options.numberOfPunches;

      let sentPunches: TestPunch[] = [];

      const send = () => {
        if (isWatchingTestPunches) {
          onTestPunchesSentSubscribers.forEach(callback => {
            // TODO: Make data below correct/more realistic
            sentPunches.push({
              Id: testPunchId,
              MsgId: testPunchId++,
              Status: 'Acked',
              SINo: parseInt(options.siCardNo, 10),
              NoOfSendTries: 1,
              SubscrId: 0,
              RSSI: 0,
              Time: new Date().toISOString(),
            });
            callback(sentPunches);
          });
        }

        punchesLeft--;

        if (punchesLeft > 0) {
          setTimeout(send, options.sendInterval);
        }
      };

      send();
    },
  };
};
