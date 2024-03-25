// https://reactnavigation.org/docs/typescript/

export type RootStackParamList = {
  DeviceNetwork: {deviceId: string};
  DeviceNetworkDetails: {deviceId: string; networkName: string};
};

export type RootDrawerParamList = {
  ScanForDevices: undefined;
  About: undefined;
  Device: {deviceId: string};
};

type Global = RootStackParamList & RootDrawerParamList;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends Global {}
  }
}
