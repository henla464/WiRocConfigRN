import {GettablePropName, SettablePropName} from './transformers';

export interface WiRocApiBackend {
  getProperty: <PropertyName extends GettablePropName>(
    propertyName: PropertyName,
  ) => Promise<string>;
  setProperty: <PropertyName extends SettablePropName>(
    propertyName: PropertyName,
    value: string | string[],
  ) => Promise<string>;
  onPropertiesChanges: (
    callback: PropertiesChangedCallback,
  ) => DeregisterCallback;
  onPunchesRecieved: (callback: PunchesRecievedCallback) => DeregisterCallback;
  onTestPunchesSent: (callback: PunchesSentCallback) => DeregisterCallback;
}

export interface Punch {
  SICardNumber: number;
  StationNumber: number;
  Time: string;
}

export interface TestPunch {
  Id: number;
  MsgId: number;
  Status: string;
  SINo: number;
  NoOfSendTries: number;
  SubscrId: number;
  RSSI: number;
  Time: string;
}

export type PropertiesChangedCallback = (
  changedProperties: Partial<Record<GettablePropName, string>>,
) => void;
export type PunchesRecievedCallback = (punches: Punch[]) => void;
export type PunchesSentCallback = (punches: TestPunch[]) => void;
export type DeregisterCallback = () => void;
