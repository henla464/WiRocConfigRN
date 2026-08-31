import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import React from 'react';
import {Dimensions} from 'react-native';
import {useTranslation} from 'react-i18next';

import {Notifications} from '@lib/components/Notifications';
import {Toasts} from '@lib/components/Toasts';
import {useActiveWiRocDevice} from '@lib/hooks/useActiveWiRocDevice';
import {useWiRocPropertyQuery} from '@lib/hooks/useWiRocPropertyQuery';

import Database from './components/Database';
import DeviceAccess from './components/DeviceAccess';
import HAM from './components/HAM';
import Settings from './components/Settings';
import SRRTestMode from './components/SRRTestMode';
import Status from './components/Status';
import Update from './components/Update';
import WakeUp from './components/WakeUp';

const Tab = createMaterialTopTabNavigator();

export default function OtherScreen() {
  const {t} = useTranslation();
  const deviceId = useActiveWiRocDevice();

  const {data: srrTestMode} = useWiRocPropertyQuery(deviceId, 'srr/testmode', {
    retry: false,
    defaultValue: -1,
  });

  const hasSrrTestMode = (srrTestMode ?? -1) >= 0;

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
        <Tab.Screen name={t('Databas')} component={Database} />
        <Tab.Screen name={t('Tid/Väckning')} component={WakeUp} />
        <Tab.Screen name={t('Status')} component={Status} />
        <Tab.Screen name={t('Inställningar')} component={Settings} />
        <Tab.Screen name={t('Amatörradio')} component={HAM} />
        <Tab.Screen name={t('Monitor åtkomst')} component={DeviceAccess} />
        <Tab.Screen name={t('Uppdatera')} component={Update} />
        {hasSrrTestMode && (
          <Tab.Screen name={t('SRR-testläge')} component={SRRTestMode} />
        )}
      </Tab.Navigator>
    </>
  );
}
