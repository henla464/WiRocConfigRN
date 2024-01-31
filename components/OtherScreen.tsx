import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Dimensions} from 'react-native';
import Database from './Database';
import WakeUp from './WakeUp';
import Status from './Status';
import Settings from './Settings';
import Update from './Update';
import {Notifications} from './Notifications';
import {useActiveWiRocDevice} from '../hooks/useActiveWiRocDevice';
import {useWiRocPropertyQuery} from '../hooks/useWiRocPropertyQuery';

const Tab = createMaterialTopTabNavigator();

export default function OtherScreen() {
  const deviceId = useActiveWiRocDevice();
  const {data: hasRTC} = useWiRocPropertyQuery(deviceId, 'hashw/rtc');

  return (
    <>
      <Notifications />
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
        {hasRTC ? <Tab.Screen name="Väckning" component={WakeUp} /> : null}
        <Tab.Screen name="Status" component={Status} />
        <Tab.Screen name="Settings" component={Settings} />
        <Tab.Screen name="Update" component={Update} />
      </Tab.Navigator>
    </>
  );
}
