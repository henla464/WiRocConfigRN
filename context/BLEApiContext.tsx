import {createContext, useContext} from 'react';
import {BluetoothLowEnergyApi} from '../hooks/useBLE';

export const BLEApiContext = createContext<BluetoothLowEnergyApi | undefined>(
  undefined,
);

export function useBLEApiContext(): BluetoothLowEnergyApi {
  const BLEAPI = useContext(BLEApiContext);

  if (BLEAPI === undefined) {
    throw new Error('UseBLEApiContext must be used with a BLEApiContext');
  }

  return BLEAPI;
}
