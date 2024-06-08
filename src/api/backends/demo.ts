import {produce} from 'immer';
import chunk from 'lodash/chunk';

import {BluetoothDevice} from '..';
import {GettablePropName} from '../transformers';
import {
  PropertiesChangedCallback,
  PunchesRecievedCallback,
  TestPunch,
  TestPunchesOptions,
  TestPunchesSentCallback,
  WiRocApiBackend,
} from '../types';
import {demoData as initialDemoData} from './demoData';

class DemoDevice {
  public demoData = {...initialDemoData};

  private watchingPunchesTimeout: ReturnType<typeof setTimeout> | null = null;
  private sendPunchesTimeouts: ReturnType<typeof setTimeout>[] = [];
  private isWatchingTestPunches = false;
  private testPunchId = 0;

  private onPunchRecievedSubscribers = new Set<PunchesRecievedCallback>();
  private onPropertiesChangesSubscribers = new Set<PropertiesChangedCallback>();
  private onTestPunchesSentSubscribers = new Set<TestPunchesSentCallback>();

  constructor(public deviceName: string) {
    this.demoData.wirocdevicename = deviceName;
  }

  public async getProperty(propertyName: GettablePropName) {
    const response = this.demoData[propertyName];
    if (response === undefined) {
      throw new Error(`Property ${propertyName} not found in demo data`);
    }
    // simulate some delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return response;
  }

  public async setProperty(propertyName: string, values: string[]) {
    // simulate some delay
    await new Promise(resolve => setTimeout(resolve, 1000));

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
      const newWifiList = chunk(this.demoData.listwifi!.split('\n'), 3)
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
      this.demoData.listwifi = newWifiList;
      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          listwifi: newWifiList,
        });
      });
      return 'OK';
    }

    if (propertyName === 'disconnectwifi') {
      const newWifiList = chunk(this.demoData.listwifi!.split('\n'), 3)
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
      this.demoData.listwifi = newWifiList;
      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          listwifi: newWifiList,
        });
      });
      return 'OK';
    }

    if (propertyName === 'renewip') {
      this.demoData.ip =
        this.demoData.ip === initialDemoData.ip
          ? '192.168.1.44'
          : initialDemoData.ip;

      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          ip: this.demoData.ip,
        });
      });

      return 'OK';
    }

    if (propertyName === 'setting') {
      const updated = [
        ...JSON.parse(this.demoData.settings!).settings,
        {
          Key: values[0],
          Value: values[1],
        },
      ];
      this.demoData.settings = JSON.stringify({settings: updated});
      return values.join('\t');
    }

    if (propertyName === 'rtc/wakeup') {
      this.demoData['rtc/wakeupenabled'] = '1';
      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          'rtc/wakeupenabled': '1',
        });
      });
      return 'OK';
    }

    if (propertyName === 'rtc/clearwakeup') {
      this.demoData['rtc/wakeupenabled'] = '0';
      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          'rtc/wakeupenabled': '0',
        });
      });
      return 'OK';
    }

    if (propertyName === 'bindrfcomm') {
      const updated = JSON.parse(this.demoData.scanbtaddresses!).map(
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
      this.demoData.scanbtaddresses = JSON.stringify(updated);
      return JSON.stringify({
        Value: updated,
      });
    }

    if (propertyName === 'releaserfcomm') {
      const updated = JSON.parse(this.demoData.scanbtaddresses!).map(
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
      this.demoData.scanbtaddresses = JSON.stringify(updated);
      return JSON.stringify({
        Value: updated,
      });
    }

    if (propertyName === 'upgradewirocpython') {
      this.demoData.wirocpythonversion =
        values[0].match(/v?(.*)/)?.[1] ?? this.demoData.wirocpythonversion;
      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          wirocpythonversion: this.demoData.wirocpythonversion,
        });
      });
      return 'OK';
    }

    if (propertyName === 'upgradewirocble') {
      this.demoData.wirocbleapiversion =
        values[0].match(/v?(.*)/)?.[1] ?? this.demoData.wirocbleapiversion;
      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          wirocbleapiversion: this.demoData.wirocbleapiversion,
        });
      });
      return 'OK';
    }

    // TODO some properties are not really settable, hence the TS error
    // @ts-expect-error
    this.demoData[propertyName] = values[0];

    this.onPropertiesChangesSubscribers.forEach(callback => {
      callback({
        [propertyName]: values[0],
      });
    });

    return values[0];
  }

  onPropertiesChange(callback: PropertiesChangedCallback) {
    this.onPropertiesChangesSubscribers.add(callback);
    return () => {
      this.onPropertiesChangesSubscribers.delete(callback);
    };
  }

  onPunchesRecieved(callback: PunchesRecievedCallback) {
    this.onPunchRecievedSubscribers.add(callback);
    return () => {
      this.onPunchRecievedSubscribers.delete(callback);
    };
  }

  onTestPunchesSent(callback: TestPunchesSentCallback) {
    this.onTestPunchesSentSubscribers.add(callback);
    return () => {
      this.onTestPunchesSentSubscribers.delete(callback);
    };
  }

  startWatchingPunches() {
    if (this.watchingPunchesTimeout) {
      return;
    }

    const send = () => {
      this.onPunchRecievedSubscribers.forEach(callback => {
        callback([
          {
            SICardNumber: 123456,
            StationNumber: 1,
            Time: new Date().toISOString(),
          },
        ]);
      });

      this.watchingPunchesTimeout = setTimeout(send, 5000);
    };

    send();
  }

  stopWatchingPunches() {
    if (this.watchingPunchesTimeout) {
      clearTimeout(this.watchingPunchesTimeout);
      this.watchingPunchesTimeout = null;
    }
  }

  startWatchingTestPunches() {
    this.isWatchingTestPunches = true;
  }

  stopWatchingTestPunches() {
    this.isWatchingTestPunches = false;
  }

  startSendingTestPunches(options: TestPunchesOptions) {
    let punchesLeft = options.numberOfPunches;

    let sentPunches: TestPunch[] = [];

    this.sendPunchesTimeouts.forEach(clearTimeout);
    this.sendPunchesTimeouts = [];

    const send = () => {
      this.onTestPunchesSentSubscribers.forEach(callback => {
        // TODO: Make data below correct/more realistic
        const punch = {
          Id: this.testPunchId,
          MsgId: this.testPunchId++,
          Status: 'Not Added',
          SINo: parseInt(options.siCardNo, 10),
          NoOfSendTries: 0,
          Type: 'TestPunch',
          RSSI: 0,
          Time: new Date().toISOString(),
          TypeName: 'LORA',
        };

        sentPunches = produce(sentPunches, draft => {
          draft.push(punch);
        });

        this.sendPunchesTimeouts.push(
          setTimeout(() => {
            sentPunches = produce(sentPunches, draft => {
              const index = draft.findIndex(p => p.Id === punch.Id);
              draft[index].Status = 'Added';
            });
            if (this.isWatchingTestPunches) {
              callback(sentPunches);
            }
          }, 1000),
        );

        this.sendPunchesTimeouts.push(
          setTimeout(() => {
            sentPunches = produce(sentPunches, draft => {
              const index = draft.findIndex(p => p.Id === punch.Id);
              draft[index].Status = 'Sent';
              draft[index].NoOfSendTries = 1;
            });
            if (this.isWatchingTestPunches) {
              callback(sentPunches);
            }
          }, 2000),
        );

        this.sendPunchesTimeouts.push(
          setTimeout(() => {
            sentPunches = produce(sentPunches, draft => {
              const index = draft.findIndex(p => p.Id === punch.Id);
              draft[index].NoOfSendTries = 2;
            });
            if (this.isWatchingTestPunches) {
              callback(sentPunches);
            }
          }, 3000),
        );

        this.sendPunchesTimeouts.push(
          setTimeout(() => {
            sentPunches = produce(sentPunches, draft => {
              const index = draft.findIndex(p => p.Id === punch.Id);
              draft[index].Status = 'Acked';
            });
            if (this.isWatchingTestPunches) {
              callback(sentPunches);
            }
          }, 4000),
        );

        if (this.isWatchingTestPunches) {
          callback(sentPunches);
        }
      });

      punchesLeft--;

      if (punchesLeft > 0) {
        this.sendPunchesTimeouts.push(setTimeout(send, options.sendInterval));
      }
    };

    send();
  }
}

const demoDevices = new Map<string, DemoDevice>();

export const createDemoApiBackend = (
  deviceId: string,
  deviceName: string,
): WiRocApiBackend => {
  const getDemoDevice = (deviceName: string) => {
    let demoDevice = demoDevices.get(deviceId);
    if (!demoDevice) {
      demoDevice = new DemoDevice(deviceName);
      demoDevices.set(deviceId, demoDevice);
      return demoDevice;
    }
    return demoDevice;
  };

  return {
    async getProperty(propertyName) {
      const demoDevice = getDemoDevice(deviceName);
      return demoDevice.getProperty(propertyName);
    },

    async setProperty(propertyName, value) {
      const demoDevice = getDemoDevice(deviceName);

      const values = Array.isArray(value) ? value : [value];

      return demoDevice.setProperty(propertyName, values);
    },

    onPropertiesChanges(callback: PropertiesChangedCallback) {
      const demoDevice = getDemoDevice(deviceName);
      return demoDevice.onPropertiesChange(callback);
    },

    onPunchesRecieved(callback) {
      const demoDevice = getDemoDevice(deviceName);
      return demoDevice.onPunchesRecieved(callback);
    },

    onTestPunchesSent(callback) {
      const demoDevice = getDemoDevice(deviceName);
      return demoDevice.onTestPunchesSent(callback);
    },

    startWatchingPunches() {
      const demoDevice = getDemoDevice(deviceName);
      demoDevice.startWatchingPunches();
    },

    stopWatchingPunches() {
      const demoDevice = getDemoDevice(deviceName);
      demoDevice.stopWatchingPunches();
    },

    startWatchingTestPunches() {
      const demoDevice = getDemoDevice(deviceName);
      demoDevice.startWatchingTestPunches();
    },

    stopWatchingTestPunches() {
      const demoDevice = getDemoDevice(deviceName);
      demoDevice.stopWatchingTestPunches();
    },

    startSendingTestPunches(options) {
      const demoDevice = getDemoDevice(deviceName);
      demoDevice.startSendingTestPunches(options);
    },
  };
};
