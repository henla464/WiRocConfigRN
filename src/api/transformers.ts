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
  'power/charging': booleanGetter(0),
  'device/name': stringGetter(1),
  'sirap/ipport': stringGetter(2),
  'sirap/ip': stringGetter(3),
  'sirap/enabled': booleanGetter(4),
  'lora/acknowledgementrequested': booleanGetter(5),
  'lora/listenonly': booleanGetter(),
  'lora/drf1268dscompatmode': booleanGetter(),
  'lora/module': stringGetter(11),
  datarate: numberGetter(6),
  'lora/channel': stringGetter(7),
  'power/battery': numberGetter(8),
  ipaddress: stringGetter(9),
  'lora/power': numberGetter(10),
  'lora/lorarange': unionGetter<LoraRange>(12),
  'device/version/wirocpython': stringGetter(13),
  'device/version/wirocbleapi': stringGetter(14),
  'device/version/wirochw': stringGetter(15),
  'sportident/usb/onewayreceive': booleanGetter(16),
  'sportident/usb/force4800baudrate': booleanGetter(17),
  'lora/mode': unionGetter<LoraMode>(18),
  'lora/rxgainenabled': booleanGetter(19),
  'lora/coderate': numberGetter(20),
  'sportident/rs232/mode': unionGetter<Rs232Mode>(21),
  'sportident/rs232/onewayreceive': booleanGetter(22),
  'sportident/rs232/force4800baudrate': booleanGetter(23),
  'btserial/onewayreceive': booleanGetter(24),
  'btserial/force4800baudrate': booleanGetter(25),
  'network/listwifi': wifiListGetter(),
  'network/ip': stringGetter(),
  'network/wifiip': stringGetter(),
  'network/usbethernetip': stringGetter(),
  'network/interfaces': jsonGetter<string[]>(),
  'lora/enabled': booleanGetter(),
  services: jsonGetter<Services>(),
  status: jsonGetter<Status>(),
  settings: jsonGetter<Settings>(),
  webserverurl: stringGetter(),
  'hashw/srr': booleanGetter(),
  'hashw/rtc': booleanGetter(),
  'hashw/rfcomm': booleanGetter(),
  'bluetooth/scan': serialDevicesGetter(),
  'bluetooth/rfcomm': serialDevicesGetter(),

  'srr/enabled': booleanGetter(),
  'srr/mode': unionGetter<SrrMode>(),
  'srr/redchannel': booleanGetter(),
  'srr/redchannellistenonly': booleanGetter(),
  'srr/bluechannel': booleanGetter(),
  'srr/bluechannellistenonly': booleanGetter(),
  'srr/hassendmode': booleanGetter(),

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
  'wifimesh/routetointerface': stringGetter(),
  'wifimesh/mpath': jsonGetter<MPaths>(),

  'network/tailscale/enabled': booleanGetter(),
  'network/tailscale/login': stringGetter(),
  'network/tailscale/status': stringGetter(),

  'network/ethernetip': stringGetter(),

  'roc/enabled': booleanGetter(),

  'network/tailscale/prefs': stringGetter(),
};

export const setters = {
  'device/name': stringSetter(),
  'sirap/ipport': stringSetter(),
  'sirap/ip': stringSetter(),
  'sirap/enabled': booleanSetter(),
  'lora/acknowledgementrequested': booleanSetter(),
  'lora/listenonly': booleanSetter(),
  'lora/drf1268dscompatmode': booleanSetter(),
  datarate: numberSetter(),
  'lora/channel': stringSetter(),
  ipaddress: stringSetter(),
  'lora/power': numberSetter(),
  'lora/lorarange': unionSetter<LoraRange>(),
  'sportident/usb/onewayreceive': booleanSetter(),
  'sportident/usb/force4800baudrate': booleanSetter(),
  'lora/mode': unionSetter<LoraMode>(),
  'lora/rxgainenabled': booleanSetter(),
  'lora/coderate': numberSetter(),
  'sportident/rs232/mode': unionSetter<Rs232Mode>(),
  'sportident/rs232/onewayreceive': booleanSetter(),
  'sportident/rs232/force4800baudrate': booleanSetter(),
  'btserial/onewayreceive': booleanSetter(),
  'btserial/force4800baudrate': booleanSetter(),
  'lora/enabled': booleanSetter(),
  webserverurl: stringSetter(),
  deletepunches: voidSetter(),
  dropalltables: voidSetter(),
  uploadlogarchive: voidSetter(),

  upgradewirocpython: stringSetter(),
  upgradewirocble: stringSetter(),

  'bluetooth/rfcomm/bind': bindRfCommSetter(),
  'bluetooth/rfcomm/release': releaseRfCommSetter(),

  'network/connectwifi': connectWifiSetter(),
  'network/disconnectwifi': disconnectWifiSetter(),
  'network/renewip': renewIpSetter(), // TODO returns OK, check value

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

  'power/shutdown': voidSetter(),

  'ham/enabled': booleanSetter(),
  'ham/callsign': stringSetter(),

  'wifimesh/enabled': booleanSetter(),
  'wifimesh/gateway/enabled': booleanSetter(),
  'wifimesh/nodenumber': numberSetter(),
  'wifimesh/routetointerface': stringSetter(),

  'network/tailscale/enabled': booleanSetter(),
  'network/tailscale/login': tailscaleLoginSetter(),

  'roc/enabled': booleanSetter(),

  setting: settingSetter(),
};

function bindRfCommSetter(): Setter<
  {btAddress: string; btName: string},
  BluetoothDevice[]
> {
  return {
    serialize: value => [value.btAddress, value.btName],
    deserializeResponse: (value: string) => JSON.parse(value).Value, // TODO check if webroute API should change?
    responseTarget: 'bluetooth/scan',
  };
}

function releaseRfCommSetter(): Setter<string, BluetoothDevice[]> {
  return {
    serialize: value => `${value}`,
    deserializeResponse: (value: string) => JSON.parse(value).Value,
    responseTarget: 'bluetooth/scan',
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

function tailscaleLoginSetter(): Setter<void, string> {
  return {
    serialize: () => '',
    deserializeResponse: (value: string) => value,
    responseTarget: 'network/tailscale/login',
  };
}

function renewIpSetter(): Setter<string, void> {
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
