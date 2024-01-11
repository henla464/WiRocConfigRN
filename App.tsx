import React, {useEffect} from 'react';
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import ScanForDevicesScreen from './components/ScanForDevicesScreen';
import DeviceBottomNavigation from './components/DeviceBottomNavigation';

import AboutScreen from './components/AboutScreen';
import NavigationHeader from './components/NavigationHeader';

import {DrawerContent} from './components/DrawerContent';
import {RootDrawerParamList} from './types/navigation';
import {createWiRocBleManager} from './utils/wiRocBleManager';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useStore} from './store';
import {useReactQuerySubscription} from './hooks/useReactQuerySubscription';

const queryClient = new QueryClient();

const Drawer2 = createDrawerNavigator<RootDrawerParamList>();

export const wiRocBleManager = createWiRocBleManager();

function App(): JSX.Element {
  const syncKnownDevices = useStore(state => state.syncKnownDevices);

  useEffect(() => {
    syncKnownDevices();
  }, [syncKnownDevices]);

  return (
    <QueryClientProvider client={queryClient}>
      <Tmp />
    </QueryClientProvider>
  );
}

const Tmp = () => {
  const activeDeviceId = useStore(state => state.activeDeviceId);
  useReactQuerySubscription(wiRocBleManager);

  return (
    <NavigationContainer>
      <Drawer2.Navigator
        initialRouteName="ScanForDevices"
        drawerContent={props => <DrawerContent {...props} />}>
        <Drawer2.Screen
          name="ScanForDevices"
          component={ScanForDevicesScreen}
          options={{
            title: 'Sök WiRoc enheter',
            headerRight: activeDeviceId
              ? () => <NavigationHeader deviceId={activeDeviceId} />
              : () => null,
          }}
        />
        <Drawer2.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: 'Om',
            headerRight: activeDeviceId
              ? () => <NavigationHeader deviceId={activeDeviceId} />
              : () => null,
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
};

export default App;
