import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import React from 'react';
import {Dimensions} from 'react-native';
import {useTheme} from 'react-native-paper';

import {Notifications} from '@lib/components/Notifications';
import {Toasts} from '@lib/components/Toasts';
import {useActiveWiRocDevice} from '@lib/hooks/useActiveWiRocDevice';
import {useWiRocPropertyQuery} from '@lib/hooks/useWiRocPropertyQuery';

import Database from './components/Database';
import HAM from './components/HAM';
import Settings from './components/Settings';
import Status from './components/Status';
import Update from './components/Update';
import WakeUp from './components/WakeUp';

const Tab = createMaterialTopTabNavigator();

export default function OtherScreen() {
  const deviceId = useActiveWiRocDevice();
  const {data: hasRTC} = useWiRocPropertyQuery(deviceId, 'hashw/rtc');

  return (
    <>
      <Notifications />
      <Toasts offset={80} />
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
        <Tab.Screen name="Inställningar" component={Settings} />
        <Tab.Screen name="Amatörradio" component={HAM} />
        <Tab.Screen name="Uppdatera" component={Update} />
      </Tab.Navigator>
    </>
  );
}
