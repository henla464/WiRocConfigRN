import {WiRocApiBackend} from '../types';

export const createRestApiBackend = (host: string): WiRocApiBackend => ({
  async getProperty(propertyName) {
    const response = await fetch(`http://${host}/api/${propertyName}`);
    const data = await response.json();
    return data.Value;
  },

  async setProperty(propertyName, value) {
    const values = Array.isArray(value) ? value : [value];
    const response = await fetch(
      `http://${host}/api/${propertyName}/${values.join('/')}`,
    );
    const data = await response.json();
    return data.Value;
  },

  onPropertiesChanges() {
    // TODO implement
    // WebSocket? Polling?
    return () => {};
  },

  onPunchesRecieved() {
    // TODO implement
    // WebSocket? Polling?
    return () => {};
  },

  onTestPunchesSent() {
    // TODO implement
    // WebSocket? Polling?
    return () => {};
  },
});
