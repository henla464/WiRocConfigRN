import React, {useEffect, useState} from 'react';
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
  const [hasRTC, setHasRTC] = useState<boolean>(false);

  useEffect(() => {
    if (BLEAPI.connectedDevice === null) {
      BLEAPI.logDebug('OtherScreen', 'useEffect', 'navigate to ScanForDevices');
      navigation.navigate('ScanForDevices' as never);
    }
  }, [BLEAPI, navigation]);

  useEffect(() => {
    if (BLEAPI.connectedDevice !== null) {
      let pc = BLEAPI.requestProperty(
        BLEAPI.connectedDevice,
        'OtherScreen',
        'hashw/rtc',
        (propName: string, propValue: string) => {
          if (propName === 'hashw/rtc') {
            setHasRTC(parseInt(propValue, 10) !== 0);
          }
        },
      );
    }
  }, [BLEAPI]);

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
        {!hasRTC ? <Tab.Screen name="Väckning" component={WakeUp} /> : null}
        <Tab.Screen name="Status" component={Status} />
        <Tab.Screen name="Settings" component={Settings} />
        <Tab.Screen name="Update" component={Update} />
      </Tab.Navigator>
    </>
  );
}
