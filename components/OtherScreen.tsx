import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Dimensions} from 'react-native';
import Database from './Database';
import WakeUp from './WakeUp';
import Status from './Status';
import Settings from './Settings';
import Update from './Update';
import ErrorBanner from './ErrorBanner';

const Tab = createMaterialTopTabNavigator();

export default function OtherScreen() {
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
