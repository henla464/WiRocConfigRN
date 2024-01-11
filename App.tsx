import React from 'react';
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import ScanForDevicesScreen from './components/ScanForDevicesScreen';
import DeviceBottomNavigation from './components/DeviceBottomNavigation';

import AboutScreen from './components/AboutScreen';
import NavigationHeader from './components/NavigationHeader';
import {BLEApiContext} from './context/BLEApiContext';
import useBLE from './hooks/useBLE';

import {DrawerContent} from './components/DrawerContent';
import {RootStackParamList} from './types/navigation';

const Drawer2 = createDrawerNavigator<RootStackParamList>();

function App(): JSX.Element {
  const BLEAPI = useBLE();

  return (
    <NavigationContainer>
      <BLEApiContext.Provider value={BLEAPI}>
        <Drawer2.Navigator
          initialRouteName="ScanForDevices"
          drawerContent={props => <DrawerContent {...props} />}>
          <Drawer2.Screen
            name="ScanForDevices"
            component={ScanForDevicesScreen}
            options={{
              title: 'Sök WiRoc enheter',
              headerRight: () => <NavigationHeader />,
            }}
          />
          <Drawer2.Screen
            name="About"
            component={AboutScreen}
            options={{
              title: 'Om',
              headerRight: () => <NavigationHeader />,
            }}
          />
          <Drawer2.Screen
            name="Device"
            component={DeviceBottomNavigation}
            options={{
              title: 'Konfigurera enhet',
              headerRight: () => <NavigationHeader />,
            }}
          />
        </Drawer2.Navigator>
      </BLEApiContext.Provider>
    </NavigationContainer>
  );
}

export default App;
