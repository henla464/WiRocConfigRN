import {DrawerScreenProps} from '@react-navigation/drawer';
import React, {useEffect} from 'react';
import {Icon} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

import {useWiRocPropertyQuery} from '@lib/hooks/useWiRocPropertyQuery';
import {useStore} from '@store';

import {wiRocBleManager} from '@lib/utils/wiRocBleManager';
import {RootDrawerParamList} from '../../types';
import ConfigurationScreen from './screens/configuration';
import OtherScreen from './screens/other';
import TestScreen from './screens/test';
import {ConfigurationTabParamList} from './types';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MaterialBottomNavigationTabBar} from '@lib/components/MaterialBottomNavigationTabBar';

const Tab = createBottomTabNavigator<ConfigurationTabParamList>();

type Props = DrawerScreenProps<RootDrawerParamList, 'Device'>;

export default function DeviceScreen(props: Props) {
  const navigation = props.navigation;
  const setActiveDeviceId = useStore(state => state.setActiveDeviceId);
  const activeDeviceId = useStore(state => state.activeDeviceId);

  const deviceId = props.route.params.deviceId;
  const navigate = props.navigation.navigate;

  useEffect(() => {
    setActiveDeviceId(deviceId);
  }, [setActiveDeviceId, deviceId]);

  const {data: deviceName} = useWiRocPropertyQuery(deviceId, 'wirocdevicename');

  useEffect(() => {
    navigation.setOptions({
      title: deviceName ?? '',
    });
  }, [navigation, deviceName]);

  useEffect(() => {
    return wiRocBleManager.onDeviceDisconnected(disconnectedDevice => {
      // TODO: make work for demo and rest as well?
      if (deviceId === disconnectedDevice.id) {
        navigate('ScanForDevices');
      }
    });
  }, [deviceId, navigate]);

  if (!activeDeviceId) {
    return null;
  }

  return <Content />;
}

function Content() {
  const {t} = useTranslation();
  return (
    <>
      <Tab.Navigator
        screenOptions={{animation: 'shift', headerShown: false}}
        tabBar={MaterialBottomNavigationTabBar}>
        <Tab.Screen
          name="configuration"
          component={ConfigurationScreen}
          options={{
            tabBarLabel: t('Konfiguration'),
            tabBarIcon: ({color}) => (
              <Icon source="router-wireless-settings" color={color} size={26} />
            ),
          }}
        />
        <Tab.Screen
          name="test"
          component={TestScreen}
          options={{
            tabBarLabel: t('Test'),
            tabBarIcon: ({color}) => (
              <Icon source="list-status" color={color} size={26} />
            ),
          }}
        />

        <Tab.Screen
          name="other"
          component={OtherScreen}
          options={{
            tabBarLabel: t('Övrigt'),
            tabBarIcon: ({color}) => (
              <Icon source="ampersand" color={color} size={26} />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
}
