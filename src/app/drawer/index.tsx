import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {DrawerContentComponentProps} from '@react-navigation/drawer/lib/typescript/src/types';
import {CommonActions} from '@react-navigation/native';
import sortBy from 'lodash/sortBy';
import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {
  Button,
  Caption,
  Drawer,
  Icon,
  Text,
  TouchableRipple,
} from 'react-native-paper';

import {useNotify} from '@lib/hooks/useNotify';
import {useStore} from '@store';

import ConnectionIcon from './components/ConnectionIcon';

export function DrawerContent(props: DrawerContentComponentProps) {
  const devices = useStore(state =>
    sortBy(Object.entries(state.wiRocDevices), ([, device]) => device.name),
  );
  const connectDevice = useStore(state => state.connectBleDevice);
  const disconnectDevice = useStore(state => state.disconnectBleDevice);
  const notify = useNotify();

  return (
    <DrawerContentScrollView>
      <View style={styles.drawerContent}>
        <View style={styles.logo}>
          <Image
            source={require('../../../images/logotransparent.png')}
            style={{width: 142, height: 68, marginTop: 15}}
          />
        </View>
        <Drawer.Section style={styles.drawerSection}>
          <DrawerItem
            label="Sök WiRoc enheter"
            icon={({focused, size, color}) => {
              return (
                <Icon source="card-search-outline" size={size} color={color} />
              );
            }}
            onPress={() => {
              props.navigation.navigate('ScanForDevices');
            }}
          />
          <DrawerItem
            label="Om"
            icon={({focused, size, color}) => {
              return (
                <Icon source="information-outline" size={size} color={color} />
              );
            }}
            onPress={() => {
              props.navigation.navigate('About');
            }}
          />
        </Drawer.Section>
        <Drawer.Section
          title={
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>
              WiRoc enheter
            </Text>
          }>
          {devices.map(([deviceId, device]) => (
            <TouchableRipple
              key={deviceId}
              onPress={async () => {
                if (
                  !device.bleConnection ||
                  device.bleConnection?.status === 'connected'
                ) {
                  props.navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{name: 'Device', params: {deviceId}}],
                    }),
                  );
                }
              }}>
              <View style={styles.foundDevices}>
                <View style={styles.columnContainer}>
                  <View>
                    <Text
                      style={
                        device.bleConnection?.status === 'connected'
                          ? styles.connectedDevice
                          : null
                      }>
                      {device.name}
                    </Text>
                  </View>
                  <View>
                    <Caption style={styles.caption}>{deviceId}</Caption>
                  </View>
                </View>
                {device.bleConnection && (
                  <Button
                    loading={device.bleConnection.status === 'connecting'}
                    onPress={async () => {
                      if (device.bleConnection?.status === 'connected') {
                        await disconnectDevice(deviceId);
                        props.navigation.navigate('ScanForDevices');
                      } else {
                        try {
                          await connectDevice(deviceId);
                          props.navigation.dispatch(
                            CommonActions.reset({
                              index: 0,
                              routes: [{name: 'Device', params: {deviceId}}],
                            }),
                          );
                        } catch (err) {
                          notify({
                            type: 'error',
                            message: `Kunde inte ansluta till enheten: ${
                              err instanceof Error ? err.message : 'Okänt fel'
                            }`,
                          });
                        }
                      }
                    }}
                    icon={({}) => (
                      <ConnectionIcon status={device.bleConnection?.status} />
                    )}>
                    {' '}
                  </Button>
                )}
              </View>
            </TouchableRipple>
          ))}
        </Drawer.Section>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  connectedDevice: {
    fontWeight: 'bold',
    lineHeight: 20,
    fontSize: 18,
  },
  columnContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  title: {
    marginTop: 20,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  logo: {
    alignItems: 'center',
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  foundDevices: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingLeft: 16,
    height: 75,
  },
});
