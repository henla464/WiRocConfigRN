import {RootDrawerParamList} from 'src/app/types';

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
