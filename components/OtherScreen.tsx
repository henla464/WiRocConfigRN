import React, {useEffect} from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Dimensions} from 'react-native';
import Database from './Database';
import WakeUp from './WakeUp';
import Status from './Status';
import Settings from './Settings';
import Update from './Update';
import ErrorBanner from './ErrorBanner';
import {useBLEApiContext} from '../context/BLEApiContext';
import {useNavigation} from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

export default function OtherScreen() {
  const BLEAPI = useBLEApiContext();
  const navigation = useNavigation();

  useEffect(() => {
    if (BLEAPI.connectedDevice === null) {
      BLEAPI.logDebug('OtherScreen', 'useEffect', 'navigate to ScanForDevices');
      navigation.navigate('ScanForDevices' as never);
    }
  }, [BLEAPI, navigation]);

  return (
    <>
      <ErrorBanner />
      <Tab.Navigator
        key="otherScreen"
        screenOptions={{
          tabBarScrollEnabled: true,
          tabBarIndicatorStyle: {
            backgroundColor: 'blue',
            height: 8,
          },
          tabBarLabelStyle: {fontSize: 18, textTransform: 'none'},
        }}
        initialLayout={{
          width: Dimensions.get('window').width,
        }}>
        <Tab.Screen name="Databas" component={Database} />
        <Tab.Screen name="Väckning" component={WakeUp} />
        <Tab.Screen name="Status" component={Status} />
        <Tab.Screen name="Settings" component={Settings} />
        <Tab.Screen name="Update" component={Update} />
      </Tab.Navigator>
    </>
  );
}
