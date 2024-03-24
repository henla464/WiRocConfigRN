import chunk from 'lodash/chunk';

import {BluetoothDevice} from '..';
import {GettablePropName} from '../transformers';
import {
  PropertiesChangedCallback,
  PunchesRecievedCallback,
  TestPunch,
  TestPunchesSentCallback,
  WiRocApiBackend,
} from '../types';
import {demoData as initialDemoData} from './demoData';

let testPunchId = 0;

export const createDemoApiBackend = (deviceName: string): WiRocApiBackend => {
  const demoData = {...initialDemoData};
  demoData.wirocdevicename = deviceName;

  let watchingPunchesTimeout: ReturnType<typeof setTimeout> | null = null;

  let isWatchingTestPunches = false;

  const onPunchRecievedSubscribers = new Set<PunchesRecievedCallback>();
  const onPropertiesChangesSubscribers = new Set<PropertiesChangedCallback>();
  const onTestPunchesSentSubscribers = new Set<TestPunchesSentCallback>();

  return {
    async getProperty(propertyName: GettablePropName) {
      const response = demoData[propertyName];
      if (!response) {
        throw new Error(`Property ${propertyName} not found in demo data`);
      }
      return response;
    },
    async setProperty(propertyName, value) {
      const values = Array.isArray(value) ? value : [value];

      if (propertyName === 'uploadlogarchive') {
        return 'OK';
      }

      if (propertyName === 'deletepunches') {
        return 'OK';
      }

      if (propertyName === 'dropalltables') {
        return 'OK';
      }

      if (propertyName === 'connectwifi') {
        console.log('Connecting to wifi', values);
        const newWifiList = chunk(demoData.listwifi!.split('\n'), 3)
          .map(([networkName, connected, rssi]) => ({
            networkName,
            isConnected: connected === 'yes',
            signalStrength: parseInt(rssi, 10),
          }))
          .map(wifi => ({
            ...wifi,
            isConnected: wifi.networkName === values[0] ? 'yes' : 'no',
          }))
          .map(
            wifi =>
              `${wifi.networkName}\n${wifi.isConnected}\n${wifi.signalStrength}`,
          )
          .join('\n');
        demoData.listwifi = newWifiList;
        onPropertiesChangesSubscribers.forEach(callback => {
          callback({
            listwifi: newWifiList,
          });
        });
        return 'OK';
      }

      if (propertyName === 'disconnectwifi') {
        console.log('Disconnecting from wifi', values);
        const newWifiList = chunk(demoData.listwifi!.split('\n'), 3)
          .map(([networkName, connected, rssi]) => ({
            networkName,
            isConnected: connected === 'yes',
            signalStrength: parseInt(rssi, 10),
          }))
          .map(wifi => ({
            ...wifi,
            isConnected: 'no',
          }))
          .map(
            wifi =>
              `${wifi.networkName}\n${wifi.isConnected}\n${wifi.signalStrength}`,
          )
          .join('\n');
        demoData.listwifi = newWifiList;
        onPropertiesChangesSubscribers.forEach(callback => {
          callback({
            listwifi: newWifiList,
          });
        });
        return 'OK';
      }

      if (propertyName === 'renewip') {
        demoData.ip =
          demoData.ip === initialDemoData.ip
            ? '192.168.1.44'
            : initialDemoData.ip;

        onPropertiesChangesSubscribers.forEach(callback => {
          callback({
            ip: demoData.ip,
          });
        });

        return 'OK';
      }

      if (propertyName === 'settings') {
        const updated = [
          ...JSON.parse(demoData.settings!).settings,
          {
            Key: values[0],
            Value: values[1],
          },
        ];
        demoData.settings = JSON.stringify({settings: updated});
        return values.join('\t');
      }

      if (propertyName === 'rtc/wakeup') {
        demoData['rtc/wakeupenabled'] = '1';
        onPropertiesChangesSubscribers.forEach(callback => {
          callback({
            'rtc/wakeupenabled': '1',
          });
        });
        return 'OK';
      }

      if (propertyName === 'rtc/clearwakeup') {
        demoData['rtc/wakeupenabled'] = '0';
        onPropertiesChangesSubscribers.forEach(callback => {
          callback({
            'rtc/wakeupenabled': '0',
          });
        });
        return 'OK';
      }

      if (propertyName === 'bindrfcomm') {
        const updated = JSON.parse(demoData.scanbtaddresses!).map(
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
        const updated = JSON.parse(demoData.scanbtaddresses!).map(
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
        demoData.wirocpythonversion =
          values[0].match(/v?(.*)/)?.[1] ?? demoData.wirocpythonversion;
        onPropertiesChangesSubscribers.forEach(callback => {
          callback({
            wirocpythonversion: demoData.wirocpythonversion,
          });
        });
        return 'OK';
      }

      if (propertyName === 'upgradewirocble') {
        demoData.wirocbleapiversion =
          values[0].match(/v?(.*)/)?.[1] ?? demoData.wirocbleapiversion;
        onPropertiesChangesSubscribers.forEach(callback => {
          callback({
            wirocbleapiversion: demoData.wirocbleapiversion,
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
