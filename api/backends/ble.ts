import {WiRocApiBackend} from '../types';
import {wiRocBleManager} from '../../App';

export const createBleApiBackend = (deviceId: string): WiRocApiBackend => ({
  async getProperty(propertyName) {
    const response = await wiRocBleManager.requestProperties(deviceId, [
      propertyName,
    ]);

    if (!(propertyName in response)) {
      console.log(
        `[BLE-API] Value for "${propertyName}" was not found in response`,
      );
      throw new Error(`Value for "${propertyName}" was not found in response`);
    }

    return response[propertyName] as string;
  },

  async setProperty(propertyName, value) {
    const values = Array.isArray(value) ? value : [value];
    const response = await wiRocBleManager.writeProperty(
      deviceId,
      propertyName,
      values.join('\t'),
    );

    if (!(propertyName in response)) {
      console.log(
        `[BLE-API] Value for "${propertyName}" was not found in response`,
      );
      throw new Error(`Value for "${propertyName}" was not found in response`);
    }

    return response[propertyName] as string;
  },

  onPropertiesChanges(callback) {
    return wiRocBleManager.onPropertiesChanged((_deviceId, newData) => {
      if (_deviceId !== deviceId) {
        return;
      }
      callback(newData);
    });
  },

  onPunchesRecieved(callback) {
    return wiRocBleManager.onPunchesRecieved((_deviceId, newData) => {
      if (_deviceId !== deviceId) {
        return;
      }
      callback(newData.punches);
    });
  },

  onTestPunchesSent(callback) {
    return wiRocBleManager.onTestPunchesSent((_deviceId, newData) => {
      if (_deviceId !== deviceId) {
        return;
      }
      callback(newData.punches);
    });
  },

  startWatchingPunches() {
    wiRocBleManager.enablePunchesNotification(deviceId);
  },

  stopWatchingPunches() {
    wiRocBleManager.disablePunchesNotification(deviceId);
  },

  startWatchingTestPunches() {
    wiRocBleManager.enableTestPunchesNotification(deviceId);
  },

  stopWatchingTestPunches() {
    wiRocBleManager.disableTestPunchesNotification(deviceId);
  },

  startSendingTestPunches(options) {
    wiRocBleManager.startSendTestPunches(deviceId, options);
  },
});
