import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import React, {useEffect} from 'react';
import 'react-native-gesture-handler';

import {createWiRocBleManager} from '@lib/utils/wiRocBleManager';
import {useStore} from '@store/index';

import {DrawerContent} from './drawer';
import NavigationHeader from './header';
import AboutScreen from './screens/about';
import DeviceBottomNavigation from './screens/device';
import ScanForDevicesScreen from './screens/scan';
import {RootDrawerParamList} from './types';

const Drawer2 = createDrawerNavigator<RootDrawerParamList>();

export const wiRocBleManager = createWiRocBleManager();

export function App() {
  const syncKnownDevices = useStore(state => state.syncKnownDevices);

  useEffect(() => {
    syncKnownDevices();
  }, [syncKnownDevices]);

  const activeDeviceId = useStore(state => state.activeDeviceId);

  return (
    <NavigationContainer>
      <Drawer2.Navigator
        initialRouteName="ScanForDevices"
        drawerContent={DrawerContent}>
        <Drawer2.Screen
          name="ScanForDevices"
          component={ScanForDevicesScreen}
          options={{
            title: 'Sök WiRoc enheter',
          }}
        />
        <Drawer2.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: 'Om',
          }}
        />
        <Drawer2.Screen
          name="Device"
          component={DeviceBottomNavigation}
          options={{
            title: 'Konfigurera enhet',
            headerRight: activeDeviceId
              ? () => <NavigationHeader deviceId={activeDeviceId} />
              : () => null,
          }}
        />
      </Drawer2.Navigator>
    </NavigationContainer>
  );
}

export default App;
