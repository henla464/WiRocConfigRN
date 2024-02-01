import React, {useEffect} from 'react';
import ConfigurationScreen from './ConfigurationScreen';
import OtherScreen from './OtherScreen';
import TestScreen from './TestScreen';
import {createMaterialBottomTabNavigator} from 'react-native-paper/react-navigation';
import {Icon} from 'react-native-paper';
import {DrawerScreenProps} from '@react-navigation/drawer';
import {
  RootDrawerParamList,
  ConfigurationTabParamList,
} from '../types/navigation';
import {useStore} from '../store';
import {wiRocBleManager} from '../App';
import {useWiRocPropertyQuery} from '../hooks/useWiRocPropertyQuery';

const Tab2 = createMaterialBottomTabNavigator<ConfigurationTabParamList>();

type Props = DrawerScreenProps<RootDrawerParamList, 'Device'>;

export default function DeviceBottomNavigation(props: Props) {
  const navigation = props.navigation;
  console.log(
    'DeviceBottomNavigation',
    'deviceId',
    props.route.params.deviceId,
  );

  const setActiveDeviceId = useStore(state => state.setActiveDeviceId);
  const activeDeviceId = useStore(state => state.activeDeviceId);
  const apiBackend = useStore(state =>
    activeDeviceId ? state.wiRocDevices[activeDeviceId].apiBackend : null,
  );

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
      if (deviceId === disconnectedDevice.id) {
        navigate('ScanForDevices');
      }
    });
  }, [deviceId, navigate]);

  if (!activeDeviceId || !apiBackend) {
    return null;
  }

  return <Content />;
}

function Content() {
  return (
    <>
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
    </>
  );
}
