import React from 'react';
import ConfigurationScreen from './ConfigurationScreen';
import OtherScreen from './OtherScreen';
import TestScreen from './TestScreen';
import {createMaterialBottomTabNavigator} from 'react-native-paper/react-navigation';
import {Icon} from 'react-native-paper';

const Tab2 = createMaterialBottomTabNavigator();

export default function DeviceBottomNavigation() {
  return (
    <Tab2.Navigator>
      <Tab2.Screen
        name="configuration"
        component={ConfigurationScreen}
        options={{
          tabBarLabel: 'Konfiguration',
          tabBarIcon: ({color}) => (
            <Icon source="router-wireless-settings" color={color} size={26} />
          ),
        }}
      />
      <Tab2.Screen
        name="test"
        component={TestScreen}
        options={{
          tabBarLabel: 'Test',
          tabBarIcon: ({color}) => (
            <Icon source="list-status" color={color} size={26} />
          ),
        }}
      />

      <Tab2.Screen
        name="other"
        component={OtherScreen}
        options={{
          tabBarLabel: 'Övrigt',
          tabBarIcon: ({color}) => (
            <Icon source="ampersand" color={color} size={26} />
          ),
        }}
      />
    </Tab2.Navigator>
  );
}
