import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {
  DrawerDescriptorMap,
  DrawerNavigationHelpers,
} from '@react-navigation/drawer/lib/typescript/src/types';
import {DrawerNavigationState, ParamListBase} from '@react-navigation/native';
import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Caption, Drawer, Text, TouchableRipple} from 'react-native-paper';
import {useBLEApiContext} from '../context/BLEApiContext';
import {Device} from 'react-native-ble-plx';
import {demoDevice} from '../hooks/useBLE';

interface DrawerContentProps {
  state: DrawerNavigationState<ParamListBase>;
  navigation: DrawerNavigationHelpers;
  descriptors: DrawerDescriptorMap;
}

export function DrawerContent(props: DrawerContentProps) {
  const BLEAPI = useBLEApiContext();

  return (
    <DrawerContentScrollView>
      <View style={styles.drawerContent}>
        <View style={styles.logo}>
          <Image
            source={require('../images/logotransparent.png')}
            style={{width: 142, height: 68}}
          />
        </View>
        <Drawer.Section style={styles.drawerSection}>
          <DrawerItem
            label="Sök WiRoc enheter"
            onPress={() => {
              props.navigation.navigate('ScanForDevices');
            }}
          />
          <DrawerItem
            label="Om"
            onPress={() => {
              props.navigation.navigate('About');
            }}
          />
        </Drawer.Section>
        <Drawer.Section title="WiRoc enheter">
          {BLEAPI.allDevices.map((device: Device) => (
            <TouchableRipple
              key={device.id}
              onPress={async () => {
                let isConnecte = await device.isConnected();
                if (isConnecte) {
                  await BLEAPI.disconnectDevice(device);
                } else {
                  await BLEAPI.connectToDevice(device);
                  props.navigation.navigate('Device');
                }
              }}>
              <View style={styles.foundDevices}>
                <Text
                  style={
                    device.id === BLEAPI.connectedDevice?.id
                      ? styles.connectedDevice
                      : null
                  }>
                  {device.name}
                </Text>
                <Caption style={styles.caption}>{device.id}</Caption>
              </View>
            </TouchableRipple>
          ))}
          <TouchableRipple
            key="11:22:33:44:55:66"
            onPress={() => {
              BLEAPI.connectToDevice(demoDevice);
              props.navigation.navigate('Device');
            }}>
            <View style={styles.foundDevices}>
              <Text>Demo Device</Text>
              <Caption style={styles.caption}>11:22:33:44:55:66</Caption>
            </View>
          </TouchableRipple>
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
  },
  title: {
    marginTop: 20,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
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
    paddingHorizontal: 16,
  },
});
