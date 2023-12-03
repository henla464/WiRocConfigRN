import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import AboutScreen from './AboutScreen';
import SendPunches from './SendPunches';

const Tab = createMaterialTopTabNavigator();

export default function TestScreen() {
  return (
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
        component={AboutScreen}
        options={{tabBarLabel: 'Visa stämplingar'}}
      />
    </Tab.Navigator>
  );
}
