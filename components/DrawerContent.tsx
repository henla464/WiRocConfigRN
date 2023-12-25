import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {
  DrawerDescriptorMap,
  DrawerNavigationHelpers,
} from '@react-navigation/drawer/lib/typescript/src/types';
import {DrawerNavigationState, ParamListBase} from '@react-navigation/native';
import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {
  Caption,
  Drawer,
  Button,
  Text,
  TouchableRipple,
  Icon,
} from 'react-native-paper';
import {useBLEApiContext} from '../context/BLEApiContext';
import {Device} from 'react-native-ble-plx';
import {demoDevice} from '../hooks/useBLE';
import ConnectionIcon from './ConnectionIcon';

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
                <View style={styles.columnContainer}>
                  <View>
                    <Text
                      style={
                        device.id === BLEAPI.connectedDevice?.id
                          ? styles.connectedDevice
                          : null
                      }>
                      {device.name}
                    </Text>
                  </View>
                  <View>
                    <Caption style={styles.caption}>{device.id}</Caption>
                  </View>
                </View>
                <Button
                  onPress={async () => {
                    if (device.id === BLEAPI.connectedDevice?.id) {
                      await BLEAPI.disconnectDevice(BLEAPI.connectedDevice);
                      props.navigation.navigate('ScanForDevices');
                    } else {
                      BLEAPI.connectToDevice(device);
                      props.navigation.navigate('Device');
                    }
                  }}
                  icon={({}) => (
                    <ConnectionIcon
                      isConnected={device.id === BLEAPI.connectedDevice?.id}
                    />
                  )}>
                  {' '}
                </Button>
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
              <View style={styles.columnContainer}>
                <View>
                  <Text
                    style={
                      demoDevice.id === BLEAPI.connectedDevice?.id
                        ? styles.connectedDevice
                        : null
                    }>
                    Demo Device
                  </Text>
                </View>
                <View>
                  <Caption style={styles.caption}>11:22:33:44:55:66</Caption>
                </View>
              </View>
              <Button
                onPress={async () => {
                  if (demoDevice.id === BLEAPI.connectedDevice?.id) {
                    await BLEAPI.disconnectDevice(BLEAPI.connectedDevice);
                    props.navigation.navigate('ScanForDevices');
                  } else {
                    BLEAPI.connectToDevice(demoDevice);
                    props.navigation.navigate('Device');
                  }
                }}
                icon={({}) => (
                  <ConnectionIcon
                    isConnected={demoDevice.id === BLEAPI.connectedDevice?.id}
                  />
                )}>
                {' '}
              </Button>
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
