import {BluetoothDevice} from '..';
import demoDeviceData from '../../hooks/demoDeviceData.json';
import {GettablePropName} from '../transformers';
import {PunchesRecievedCallback, WiRocApiBackend} from '../types';

const demoData = demoDeviceData as unknown as Record<GettablePropName, string>;

export const createDemoApiBackend = (): WiRocApiBackend => {
  const onPunchRecievedSubscribers = new Set<PunchesRecievedCallback>();

  setInterval(() => {
    onPunchRecievedSubscribers.forEach(callback => {
      callback([
        {
          SICardNumber: 123456,
          StationNumber: 1,
          Time: new Date().toISOString(),
        },
      ]);
    });
  }, 5000);

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

      // TODO some properties are not really settable, hence the TS error
      // @ts-expect-error
      demoData[propertyName] = values[0];

      return values[0];
    },

    onPropertiesChanges() {
      // Currently not supported
      return () => {};
    },

    onPunchesRecieved(callback) {
      onPunchRecievedSubscribers.add(callback);
      return () => {
        onPunchRecievedSubscribers.delete(callback);
      };
    },

    onTestPunchesSent() {
      // TODO implement
      return () => {};
    },
  };
};
