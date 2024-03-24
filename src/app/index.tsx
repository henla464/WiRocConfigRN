import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import 'react-native-gesture-handler';

import {createWiRocBleManager} from '@lib/utils/wiRocBleManager';
import {useStore} from '@store/index';

import {DrawerContent} from './drawer';
import NavigationHeader from './header';
import AboutScreen from './screens/about';
import DeviceScreen from './screens/device';
import ScanForDevicesScreen from './screens/scan';
import {RootDrawerParamList} from './types';

const Drawer = createDrawerNavigator<RootDrawerParamList>();

export const wiRocBleManager = createWiRocBleManager();

export function App() {
  const syncKnownDevices = useStore(state => state.syncKnownDevices);

  useEffect(() => {
    syncKnownDevices();
  }, [syncKnownDevices]);

  const activeDeviceId = useStore(state => state.activeDeviceId);

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="ScanForDevices"
        drawerContent={DrawerContent}>
        <Drawer.Screen
          name="ScanForDevices"
          component={ScanForDevicesScreen}
          options={{
            title: 'Sök WiRoc enheter',
          }}
        />
        <Drawer.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: 'Om',
          }}
        />
        <Drawer.Screen
          name="Device"
          component={DeviceScreen}
          options={{
            title: 'Konfigurera enhet',
            headerRight: activeDeviceId
              ? () => <NavigationHeader deviceId={activeDeviceId} />
              : () => null,
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default App;
