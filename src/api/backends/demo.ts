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
    this.demoData['device/name'] = deviceName;
  }

  public async getProperty(propertyName: GettablePropName) {
    let response = this.demoData[propertyName];
    // Fall back to initialDemoData in case new properties were added
    // after this DemoDevice instance was cached (e.g. across Fast Refresh).
    if (response === undefined && propertyName in initialDemoData) {
      response = initialDemoData[propertyName];
      // Also cache it in the instance so next lookup is fast
      this.demoData[propertyName] = response;
    }
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

    if (propertyName === 'network/connectwifi') {
      const newWifiList = chunk(this.demoData['network/listwifi']!.split('\n'), 3)
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
      this.demoData['network/listwifi'] = newWifiList;
      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          'network/listwifi': newWifiList,
        });
      });
      return 'OK';
    }

    if (propertyName === 'network/disconnectwifi') {
      const newWifiList = chunk(this.demoData['network/listwifi']!.split('\n'), 3)
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
      this.demoData['network/listwifi'] = newWifiList;
      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          'network/listwifi': newWifiList,
        });
      });
      return 'OK';
    }

    if (propertyName === 'network/renewip') {
      this.demoData['network/ip'] =
        this.demoData['network/ip'] === initialDemoData['network/ip']
          ? '192.168.1.44'
          : initialDemoData['network/ip'];

      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          'network/ip': this.demoData['network/ip'],
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

    if (propertyName === 'rtc/wakeupenabled') {
      this.demoData['rtc/wakeupenabled'] = values[0];
      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          'rtc/wakeupenabled': values[0],
        });
      });
      return values[0];
    }

    if (propertyName === 'rtc/datetime') {
      this.demoData['rtc/datetime'] = values[0];
      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          'rtc/datetime': values[0],
        });
      });
      return values[0];
    }

    if (propertyName === 'network/tailscale/enabled') {
      this.demoData['network/tailscale/enabled'] = values[0];
      if (values[0] === '1') {
        // Enable: set status to running but not yet logged in
        const status = {
          Version: '1.80.0',
          TUN: true,
          BackendState: 'Running',
          TailscaleIPs: [],
          Self: {
            ID: 'demo-node',
            HostName: 'WiRocDemo',
            Online: false,
            TailscaleIPs: [],
            UserID: undefined,
          },
          Peer: {},
          User: {},
        };
        this.demoData['network/tailscale/status'] = JSON.stringify(status);
        this.demoData['network/tailscale/prefs'] = JSON.stringify({
          RouteAll: false,
          LoggedOut: true,
          AdvertiseRoutes: null,
        });
      } else {
        // Disable: reset
        this.demoData['network/tailscale/status'] = JSON.stringify({
          Version: '',
          TUN: false,
          BackendState: 'NoState',
          TailscaleIPs: [],
          Self: {
            ID: 'demo-node',
            HostName: 'WiRocDemo',
            Online: false,
            TailscaleIPs: [],
            UserID: undefined,
          },
          Peer: {},
          User: {},
        });
        this.demoData['network/tailscale/prefs'] = JSON.stringify({
          RouteAll: false,
          LoggedOut: true,
          AdvertiseRoutes: null,
        });
        this.demoData['network/tailscale/login'] = '';
      }
      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          'network/tailscale/enabled': values[0],
          'network/tailscale/status': this.demoData['network/tailscale/status'],
          'network/tailscale/prefs': this.demoData['network/tailscale/prefs'],
          'network/tailscale/login': this.demoData['network/tailscale/login'],
        });
      });
      return values[0];
    }

    if (propertyName === 'network/tailscale/login') {
      const loginUrl =
        'https://login.tailscale.com/a/demologin' +
        Math.random().toString(36).substring(2, 10);
      this.demoData['network/tailscale/login'] = loginUrl;
      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          'network/tailscale/login': loginUrl,
        });
      });

      // Simulate login completing after 2 seconds
      setTimeout(() => {
        const status = {
          Version: '1.80.0',
          TUN: true,
          BackendState: 'Running',
          TailscaleIPs: ['100.64.0.1'],
          Self: {
            ID: 'demo-node',
            HostName: 'WiRocDemo',
            Online: true,
            TailscaleIPs: ['100.64.0.1'],
            UserID: 12345,
          },
          Peer: {},
          User: {12345: {ID: 12345, LoginName: 'demo', DisplayName: 'Demo'}},
        };
        this.demoData['network/tailscale/status'] = JSON.stringify(status);
        this.demoData['network/tailscale/prefs'] = JSON.stringify({
          RouteAll: true,
          LoggedOut: false,
          AdvertiseRoutes: ['192.168.1.0/24'],
        });
        const updated: Record<string, string> = {
          'network/tailscale/status': this.demoData['network/tailscale/status'],
          'network/tailscale/prefs': this.demoData['network/tailscale/prefs'],
        };
        this.onPropertiesChangesSubscribers.forEach(callback => {
          callback(updated);
        });
      }, 2000);

      return loginUrl;
    }

    if (propertyName === 'wifimesh/enabled') {
      this.demoData['wifimesh/enabled'] = values[0];
      if (values[0] === '1') {
        const nodeNumber = this.demoData['wifimesh/nodenumber'] || '1';
        this.demoData['wifimesh/ipaddress'] = `192.168.25.${nodeNumber}`;
        this.demoData['wifimesh/interfacecreated'] = '1';
        this.demoData['wifimesh/mac'] = '02:00:00:00:00:01';
      } else {
        this.demoData['wifimesh/ipaddress'] = '';
        this.demoData['wifimesh/interfacecreated'] = '0';
        this.demoData['wifimesh/mac'] = '';
      }
      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          'wifimesh/enabled': values[0],
          'wifimesh/ipaddress': this.demoData['wifimesh/ipaddress'],
          'wifimesh/interfacecreated': this.demoData['wifimesh/interfacecreated'],
          'wifimesh/mac': this.demoData['wifimesh/mac'],
        });
      });
      return values[0];
    }

    if (propertyName === 'wifimesh/nodenumber') {
      this.demoData['wifimesh/nodenumber'] = values[0];
      // Update mesh IP when node number changes and mesh is enabled
      if (this.demoData['wifimesh/enabled'] === '1') {
        this.demoData['wifimesh/ipaddress'] = `192.168.25.${values[0]}`;
      }
      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          'wifimesh/nodenumber': values[0],
          'wifimesh/ipaddress': this.demoData['wifimesh/ipaddress'],
        });
      });
      return values[0];
    }

    if (propertyName === 'bluetooth/rfcomm/bind') {
      const updated = JSON.parse(this.demoData['bluetooth/scan']!).map(
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
      this.demoData['bluetooth/scan'] = JSON.stringify(updated);
      return JSON.stringify({
        Value: updated,
      });
    }

    if (propertyName === 'bluetooth/rfcomm/release') {
      const updated = JSON.parse(this.demoData['bluetooth/scan']!).map(
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
      this.demoData['bluetooth/scan'] = JSON.stringify(updated);
      return JSON.stringify({
        Value: updated,
      });
    }

    if (propertyName === 'upgradewirocpython') {
      this.demoData['device/version/wirocpython'] =
        values[0].match(/v?(.*)/)?.[1] ?? this.demoData['device/version/wirocpython'];
      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          'device/version/wirocpython': this.demoData['device/version/wirocpython'],
        });
      });
      return 'OK';
    }

    if (propertyName === 'upgradewirocble') {
      this.demoData['device/version/wirocbleapi'] =
        values[0].match(/v?(.*)/)?.[1] ?? this.demoData['device/version/wirocbleapi'];
      this.onPropertiesChangesSubscribers.forEach(callback => {
        callback({
          'device/version/wirocbleapi': this.demoData['device/version/wirocbleapi'],
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

    const outputTypes = ['LORA', 'SIRAP', 'ROC', 'SRR'];

    const send = () => {
      const baseId = this.testPunchId++;

      this.onTestPunchesSentSubscribers.forEach(callback => {
        outputTypes.forEach((typeName, typeIndex) => {
          const punchId = `${baseId}_${typeIndex}`;
          const punch: TestPunch = {
            Id: punchId,
            MsgId: baseId,
            Status: 'Not added',
            SINo: parseInt(options.siCardNo, 10),
            NoOfSendTries: 0,
            Type: 'TestPunch',
            RSSI: typeName === 'LORA' || typeName === 'SRR' ? Math.floor(Math.random() * 40) - 120 : 0,
            SNR: typeName === 'LORA' || typeName === 'SRR' ? Math.floor(Math.random() * 10) : 0,
            Time: new Date().toISOString(),
            TypeName: typeName,
            TestPunchId: baseId,
            MaxTries: 3,
          };

          sentPunches = produce(sentPunches, draft => {
            draft.push(punch);
          });

          // Stagger timing per output type
          const baseDelay = typeIndex * 200;

          this.sendPunchesTimeouts.push(
            setTimeout(() => {
              sentPunches = produce(sentPunches, draft => {
                const index = draft.findIndex(p => p.Id === punchId);
                if (index >= 0) {
                  draft[index].NoOfSendTries = 1;
                  // ROC/SIRAP skip Added, go straight to Sent
                  if (typeName === 'SIRAP' || typeName === 'ROC') {
                    draft[index].Status = 'Sent';
                  } else {
                    draft[index].Status = 'Added';
                  }
                }
              });
              if (this.isWatchingTestPunches) {
                callback(sentPunches);
              }
            }, 1000 + baseDelay),
          );

          if (typeName === 'LORA' || typeName === 'SRR') {
            // Radio types: go through Added -> Acked
            this.sendPunchesTimeouts.push(
              setTimeout(() => {
                sentPunches = produce(sentPunches, draft => {
                  const index = draft.findIndex(p => p.Id === punchId);
                  if (index >= 0) {
                    draft[index].NoOfSendTries = typeName === 'SRR' ? 2 : 1;
                    draft[index].Status = 'Acked';
                  }
                });
                if (this.isWatchingTestPunches) {
                  callback(sentPunches);
                }
              }, 2500 + baseDelay),
            );
          }

          if (this.isWatchingTestPunches) {
            callback(sentPunches);
          }
        });
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
