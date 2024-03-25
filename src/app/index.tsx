import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import 'react-native-gesture-handler';

import {DeviceAppBar} from '@lib/components/DeviceAppBar';
import {createWiRocBleManager} from '@lib/utils/wiRocBleManager';
import {useStore} from '@store/index';

import {DrawerContent} from './drawer';
import NavigationHeader from './header';
import AboutScreen from './screens/about';
import DeviceScreen from './screens/device';
import {DeviceNetworkScreen} from './screens/device-network';
import {DeviceNetworkDetailsScreen} from './screens/device-network-details';
import ScanForDevicesScreen from './screens/scan';
import {RootDrawerParamList} from './types';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator<RootDrawerParamList>();

export const wiRocBleManager = createWiRocBleManager();

function Root() {
  const activeDeviceId = useStore(state => state.activeDeviceId);
  return (
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
  );
}

export function App() {
  const syncKnownDevices = useStore(state => state.syncKnownDevices);

  useEffect(() => {
    syncKnownDevices();
  }, [syncKnownDevices]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Root">
        <Stack.Screen
          name="Root"
          component={Root}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="DeviceNetwork"
          // @ts-expect-error
          component={DeviceNetworkScreen}
          options={{
            header: DeviceAppBar,
            title: 'Nätverksanslutning',
          }}
        />
        <Stack.Screen
          name="DeviceNetworkDetails"
          // @ts-expect-error
          component={DeviceNetworkDetailsScreen}
          options={{
            header: DeviceAppBar,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
