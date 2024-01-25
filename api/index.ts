export type LoraMode = 'RECEIVER' | 'REPEATER' | 'SENDER';
export type LoraRange = 'UL' | 'XL' | 'L' | 'ML' | 'MS' | 'S';
export interface Wifi {
  networkName: string;
  isConnected: boolean;
  signalStrength: number;
}
export interface BluetoothDevice {
  Name: string;
  BTAddress: string;
  Status: string; // NotConnected | Connected | ReadError
  Found: string;
}

export type SrrMode = 'RECEIVE' | 'SEND';
export type Rs232Mode = 'RECEIVE' | 'SEND';

export interface Services {
  services: Array<{
    Name: string;
    Status: string;
  }>;
}

export interface Status {
  inputAdapters: InputAdapter[];
  subscriberAdapters: SubscriberAdapter[];
}

export interface InputAdapter {
  TypeName: string;
  InstanceName: string;
}

export interface SubscriberAdapter {
  TypeName: string;
  InstanceName: string;
  MessageInName: string;
  MessageInSubTypeName: string;
  MessageOutName: string;
  MessageOutSubTypeName: string;
  Enabled: string;
}

export interface Settings {
  settings: Setting[];
}

export interface Setting {
  Key: string;
  Value: string;
}
