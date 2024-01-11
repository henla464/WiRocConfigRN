import React, {useEffect} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import SendPunches from './SendPunches';
import ViewPunches from './ViewPunches';
import {useBLEApiContext} from '../context/BLEApiContext';
import {useNavigation} from '@react-navigation/native';
import {useLogger} from '../hooks/useLogger';
import {Notifications} from './Notifications';

const Tab = createMaterialTopTabNavigator();

export default function TestScreen() {
  const logger = useLogger();
  const BLEAPI = useBLEApiContext();
  const navigation = useNavigation();

  useEffect(() => {
    if (BLEAPI.connectedDevice === null) {
      logger.debug('TestScreen', 'useEffect', 'navigate to ScanForDevices');
      navigation.navigate('ScanForDevices');
    }
  }, [logger, BLEAPI, navigation]);

  return (
    <>
      <Notifications />
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
