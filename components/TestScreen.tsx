import React, {useEffect} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import SendPunches from './SendPunches';
import ViewPunches from './ViewPunches';
import {useBLEApiContext} from '../context/BLEApiContext';
import {useNavigation} from '@react-navigation/native';
import ErrorBanner from './ErrorBanner';

const Tab = createMaterialTopTabNavigator();

export default function TestScreen() {
  const BLEAPI = useBLEApiContext();
  const navigation = useNavigation();

  useEffect(() => {
    if (BLEAPI.connectedDevice === null) {
      BLEAPI.logDebug('TestScreen', 'useEffect', 'navigate to ScanForDevices');
      navigation.navigate('ScanForDevices' as never);
    }
  }, [BLEAPI, navigation]);

  return (
    <>
      <ErrorBanner />
      <Tab.Navigator
        screenOptions={{
          //tabBarActiveTintColor: Colors.white,
          tabBarLabelStyle: {fontSize: 18, textTransform: 'none'},
          //tabBarStyle: {backgroundColor: Colors.primary},
        }}>
        <Tab.Screen
          name="SENDPUNCHES"
          options={{tabBarLabel: 'Skicka stämplingar'}}
          component={SendPunches}
        />
        <Tab.Screen
          name="ViewPunches"
          component={ViewPunches}
          options={{tabBarLabel: 'Visa stämplingar'}}
        />
      </Tab.Navigator>
    </>
  );
}
