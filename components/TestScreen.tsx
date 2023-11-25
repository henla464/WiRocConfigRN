import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import AboutScreen from './AboutScreen';

const Tab = createMaterialTopTabNavigator();

export default function TestScreen() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="SendPunches" component={AboutScreen} />
      <Tab.Screen name="ViewPunches" component={AboutScreen} />
    </Tab.Navigator>
  );
}
