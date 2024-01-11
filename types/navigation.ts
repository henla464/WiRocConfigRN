// https://reactnavigation.org/docs/typescript/

export type RootDrawerParamList = {
  ScanForDevices: undefined;
  About: undefined;
  Device: {deviceId: string};
};

export type ConfigurationTabParamList = {
  // tabs
  configuration: undefined;
  test: undefined;
  other: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootDrawerParamList {}
  }
}
