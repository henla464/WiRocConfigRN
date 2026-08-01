import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {Dimensions, SafeAreaView} from 'react-native';
import {useTranslation} from 'react-i18next';

import {Notifications} from '@lib/components/Notifications';
import {Toasts} from '@lib/components/Toasts';

import {RootStackParamList} from 'src/app/types';

import WifiMesh from '../device/screens/other/components/WifiMesh';
import EthernetIPs from './components/EthernetIPs';
import {WiFiNetwork} from './components/WiFiNetwork';
import TailscaleVPN from './components/TailscaleVPN';

const Tab = createMaterialTopTabNavigator();

type Props = NativeStackScreenProps<RootStackParamList, 'DeviceNetwork'>;

export const DeviceNetworkScreen = (props: Props) => {
  const {t} = useTranslation();
  const deviceId = props.route.params.deviceId;
  const navigation = props.navigation;

  return (
    <>
      <SafeAreaView style={{flex: 1}}>
        <Notifications />
        <Toasts offset={80} />
        <Tab.Navigator
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
          <Tab.Screen name={t('WiFi')}>
            {() => (
              <WiFiNetwork navigation={navigation} deviceId={deviceId} />
            )}
          </Tab.Screen>
          <Tab.Screen name={t('Ethernet')}>
            {() => <EthernetIPs deviceId={deviceId} />}
          </Tab.Screen>
          <Tab.Screen name={t('Tailscale VPN')}>
            {() => <TailscaleVPN deviceId={deviceId} />}
          </Tab.Screen>
          <Tab.Screen name={t('Wifi-mesh')}>
            {() => <WifiMesh />}
          </Tab.Screen>
        </Tab.Navigator>
      </SafeAreaView>
    </>
  );
};
