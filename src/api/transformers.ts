import chunk from 'lodash/chunk';
import orderBy from 'lodash/orderBy';
import uniqBy from 'lodash/uniqBy';

import {
  BluetoothDevice,
  LoraMode,
  LoraRange,
  Rs232Mode,
  Services,
  Setting,
  Settings,
  SrrMode,
  Status,
  Wifi,
  MPaths,
} from '.';

export type Setters = typeof setters;
export type SettablePropName = keyof typeof setters;
export type SettableValues = {
  [key in keyof typeof setters]: Parameters<
    (typeof setters)[key]['serialize']
  >[0];
};

export type Getters = typeof getters;
export type GettablePropName = keyof typeof getters;
export type GettableValues = {
  [key in keyof typeof getters]: ReturnType<
    (typeof getters)[key]['deserialize']
  >;
};
export type GetterValueOf<PropName extends GettablePropName> = ReturnType<
  Getters[PropName]['deserialize']
>;

interface Getter<T> {
  index?: number; // undefined means not part of 'all'
  deserialize: (value: string) => T;
}

interface Setter<T, R = T> {
  serialize: (value: T) => string | string[];
  deserializeResponse: (value: string) => R;
  responseTarget?: GettablePropName;
}

export const getters = {
  ischarging: booleanGetter(0),
  wirocdevicename: stringGetter(1),
  sendtosirapipport: stringGetter(2),
  sendtosirapip: stringGetter(3),
  sendtosirapenabled: booleanGetter(4),
  acknowledgementrequested: booleanGetter(5),
  datarate: numberGetter(6),
  channel: stringGetter(7),
  batterylevel: numberGetter(8),
  ipaddress: stringGetter(9),
  power: numberGetter(10),
  loramodule: stringGetter(11),
  lorarange: unionGetter<LoraRange>(12),
  wirocpythonversion: stringGetter(13),
  wirocbleapiversion: stringGetter(14),
  wirochwversion: stringGetter(15),
  onewayreceive: booleanGetter(16),
  force4800baudrate: booleanGetter(17),
  loramode: unionGetter<LoraMode>(18),
  rxgainenabled: booleanGetter(19),
  coderate: numberGetter(20),
  rs232mode: unionGetter<Rs232Mode>(21),
  rs232onewayreceive: booleanGetter(22),
  forcers2324800baudrate: booleanGetter(23),
  btserialonewayreceive: booleanGetter(24),
  forcebtserial4800baudrate: booleanGetter(25),
  listwifi: wifiListGetter(),
  ip: stringGetter(),
  'lora/enabled': booleanGetter(),
  services: jsonGetter<Services>(),
  status: jsonGetter<Status>(),
  settings: jsonGetter<Settings>(),
  webserverurl: stringGetter(),
  'hashw/srr': booleanGetter(),
  'hashw/rtc': booleanGetter(),
  scanbtaddresses: serialDevicesGetter(),

  'srr/enabled': booleanGetter(),
  'srr/mode': unionGetter<SrrMode>(),
  'srr/redchannel': booleanGetter(),
  'srr/redchannellistenonly': booleanGetter(),
  'srr/bluechannel': booleanGetter(),
  'srr/bluechannellistenonly': booleanGetter(),

  'rtc/datetime': stringGetter(),
  'rtc/wakeup': stringGetter(),
  'rtc/wakeupenabled': booleanGetter(),

  'ham/enabled': booleanGetter(26),
  'ham/callsign': stringGetter(),

  'wifimesh/enabled': booleanGetter(),
  'wifimesh/gateway/enabled': booleanGetter(),
  'wifimesh/nodenumber': numberGetter(),
  'wifimesh/ipnetworknumber': numberGetter(),
  'wifimesh/ipaddress': stringGetter(),
  'wifimesh/interfacecreated': booleanGetter(),
  'wifimesh/mac': stringGetter(),
  'wifimesh/mpath': jsonGetter<MPaths>(),
};

export const setters = {
  wirocdevicename: stringSetter(),
  sendtosirapipport: stringSetter(),
  sendtosirapip: stringSetter(),
  sendtosirapenabled: booleanSetter(),
  acknowledgementrequested: booleanSetter(),
  datarate: numberSetter(),
  channel: stringSetter(),
  ipaddress: stringSetter(),
  power: numberSetter(),
  lorarange: unionSetter<LoraRange>(),
  onewayreceive: booleanSetter(),
  force4800baudrate: booleanSetter(),
  loramode: unionSetter<LoraMode>(),
  rxgainenabled: booleanSetter(),
  coderate: numberSetter(),
  rs232mode: unionSetter<Rs232Mode>(),
  rs232onewayreceive: booleanSetter(),
  forcers2324800baudrate: booleanSetter(),
  btserialonewayreceive: booleanSetter(),
  forcebtserial4800baudrate: booleanSetter(),
  'lora/enabled': booleanSetter(),
  webserverurl: stringSetter(),
  deletepunches: voidSetter(),
  dropalltables: voidSetter(),
  uploadlogarchive: voidSetter(),

  upgradewirocpython: stringSetter(),
  upgradewirocble: stringSetter(),

  bindrfcomm: bindRfCommSetter(),
  releaserfcomm: releaseRfCommSetter(),

  connectwifi: connectWifiSetter(),
  disconnectwifi: disconnectWifiSetter(),
  renewip: renewIpSetter(), // TODO returns OK, check value

  'srr/enabled': booleanSetter(),
  'srr/mode': unionSetter<SrrMode>(),
  'srr/redchannel': booleanSetter(),
  'srr/redchannellistenonly': booleanSetter(),
  'srr/bluechannel': booleanSetter(),
  'srr/bluechannellistenonly': booleanSetter(),

  'rtc/datetime': stringSetter(),
  'rtc/wakeup': stringSetter(),
  'rtc/wakeupenabled': booleanSetter(),
  'rtc/clearwakeup': voidSetter(),

  'ham/enabled': booleanSetter(),
  'ham/callsign': stringSetter(),

  'wifimesh/enabled': booleanSetter(),
  'wifimesh/gateway/enabled': booleanSetter(),
  'wifimesh/nodenumber': numberSetter(),

  setting: settingSetter(),
};

function bindRfCommSetter(): Setter<
  {btAddress: string; btName: string},
  BluetoothDevice[]
> {
  return {
    serialize: value => [value.btAddress, value.btName],
    deserializeResponse: (value: string) => JSON.parse(value).Value, // TODO check if webroute API should change?
    responseTarget: 'scanbtaddresses',
  };
}

function releaseRfCommSetter(): Setter<string, BluetoothDevice[]> {
  return {
    serialize: value => `${value}`,
    deserializeResponse: (value: string) => JSON.parse(value).Value,
    responseTarget: 'scanbtaddresses',
  };
}

function serialDevicesGetter(): Getter<BluetoothDevice[]> {
  return {
    deserialize: (value: string) => JSON.parse(value),
  };
}

function booleanGetter(index?: number): Getter<boolean> {
  return {
    index,
    deserialize: (value: string) => value !== '0',
  };
}

function booleanSetter(): Setter<boolean> {
  return {
    serialize: (value: boolean) => (value ? '1' : '0'),
    deserializeResponse: (value: string) => value !== '0',
  };
}

function numberGetter(index?: number): Getter<number> {
  return {
    index,
    deserialize: (value: string) => parseInt(value, 10),
  };
}

function numberSetter(): Setter<number> {
  return {
    serialize: (value: number) => value.toString(),
    deserializeResponse: (value: string) => parseInt(value, 10),
  };
}

function stringGetter(index?: number): Getter<string> {
  return {
    index,
    deserialize: (value: string) => value,
  };
}

function stringSetter(): Setter<string> {
  return {
    serialize: (value: string) => value,
    deserializeResponse: (value: string) => value,
  };
}

function unionGetter<T extends string>(index?: number): Getter<T> {
  return {
    index,
    deserialize: (value: string) => value.toUpperCase() as T,
  };
}

function unionSetter<T extends string>(): Setter<T> {
  return {
    serialize: (value: T) => value.toUpperCase() as string,
    deserializeResponse: (value: string) => value.toUpperCase() as T,
  };
}

function wifiListGetter(): Getter<Wifi[]> {
  return {
    deserialize: (value: string): Wifi[] => {
      const wifiNetworks = chunk(value.split('\n'), 3).map(
        ([networkName, connected, rssi]) => ({
          networkName,
          isConnected: connected === 'yes',
          signalStrength: parseInt(rssi, 10),
        }),
      );

      return uniqBy(
        orderBy(
          wifiNetworks,
          ['isConnected', 'signalStrength'],
          ['desc', 'desc'],
        ),
        // since we order by isConnected desc, we will not risk filtering out
        // the connected network
        'networkName',
      );
    },
  };
}

function voidSetter(): Setter<void> {
  return {
    serialize: () => '',
    deserializeResponse: () => {},
  };
}

function jsonGetter<T>(): Getter<T> {
  return {
    deserialize: (value: string) => JSON.parse(value),
  };
}

function settingSetter(): Setter<Setting, Setting> {
  return {
    serialize: value => [value.Key, value.Value],
    deserializeResponse: (value: string) => {
      const keyAndValue = value.split('\t');
      return {
        Key: keyAndValue[0],
        Value: keyAndValue[1],
      };
    },
    responseTarget: 'settings',
  };
}

function connectWifiSetter(): Setter<
  {networkName: string; password: string},
  void
> {
  return {
    serialize: value => [value.networkName, value.password],
    deserializeResponse: (value: string) => {
      if (value !== 'OK') {
        throw new Error(value);
      }
      return;
    },
  };
}

function disconnectWifiSetter(): Setter<void, void> {
  return {
    serialize: () => '',
    deserializeResponse: (value: string) => {
      if (value !== 'OK') {
        throw new Error(value);
      }
      return;
    },
  };
}

function renewIpSetter(): Setter<'ethernet' | 'wifi', void> {
  return {
    serialize: value => value,
    deserializeResponse: (value: string) => {
      if (value !== 'OK') {
        throw new Error(value);
      }
      return;
    },
  };
}
