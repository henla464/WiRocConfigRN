import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import AboutScreen from './AboutScreen';
import {Text} from 'react-native';

const Tab = createMaterialTopTabNavigator();

export default function OtherScreen() {
  return (
    <Tab.Navigator key="otherScreen">
      <Tab.Screen name="Databas" component={AboutScreen} />
      <Tab.Screen name="WakeUp" component={AboutScreen} />
      <Tab.Screen name="Status" component={AboutScreen} />
      <Tab.Screen name="Settings" component={AboutScreen} />
      <Tab.Screen name="Update" component={AboutScreen} />
    </Tab.Navigator>
    //<Text>other</Text>
  );
}
