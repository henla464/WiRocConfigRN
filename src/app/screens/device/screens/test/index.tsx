import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import React from 'react';

import {Notifications} from '@lib/components/Notifications';

import SendPunches from './components/SendPunches';
import ViewPunches from './components/ViewPunches';

const Tab = createMaterialTopTabNavigator();

export default function TestScreen() {
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
