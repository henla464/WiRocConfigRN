// https://reactnavigation.org/docs/typescript/

export type RootStackParamList = {
  ScanForDevices: undefined;
  About: undefined;
  Device: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
