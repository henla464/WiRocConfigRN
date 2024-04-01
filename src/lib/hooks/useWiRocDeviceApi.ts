import {useMemo} from 'react';

import {createBleApiBackend} from '@api/backends/ble';
import {createDemoApiBackend} from '@api/backends/demo';
import {createRestApiBackend} from '@api/backends/rest';
import {WiRocApiBackend} from '@api/types';
import {useStore} from '@store';

export const useWiRocDeviceApi = (deviceId: string): WiRocApiBackend => {
  const wiRocDevice = useStore(state => state.wiRocDevices[deviceId]);
  return useMemo(() => {
    if (!wiRocDevice) {
      throw new Error(`Device with id ${deviceId} not found`);
    }

    switch (wiRocDevice.apiBackend) {
      case 'ble':
        if (!wiRocDevice.bleConnection?.deviceId) {
          throw new Error('BLE deviceId not set');
        }
        return createBleApiBackend(wiRocDevice.bleConnection.deviceId);
      case 'rest':
        if (!wiRocDevice.restApiHost) {
          throw new Error('REST API host not set');
        }
        return createRestApiBackend(wiRocDevice.restApiHost);
      case 'demo':
        if (!wiRocDevice.name) {
          throw new Error('Demo device name not set');
        }
        return createDemoApiBackend(deviceId, wiRocDevice.name);
      default:
        throw new Error(`Unknown API backend: ${wiRocDevice.apiBackend}`);
    }
  }, [deviceId, wiRocDevice]);
};
