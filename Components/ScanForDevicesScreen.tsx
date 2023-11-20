import React from 'react';
import {useState} from 'react';
import {Button} from 'react-native-paper';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import useBLE from '../Hooks/useBLE';
import {Device} from 'react-native-ble-plx';

export default function ScanForDevicesScreen() {
  const {
    requestPermissions,
    allDevices,
    scanForDevices,
    connectToDevice,
    connectedDevice,
  } = useBLE();
  const scan = async () => {
    requestPermissions((isGranted: boolean) => {
      if (isGranted) {
        scanForDevices();
      }
    });
  };

  const connect = async () => {
    await connectToDevice(allDevices[0]);
    if (connectedDevice?.isConnected) {
    } else {
    }
  };

  return (
    <SafeAreaView style={Colors.lighter}>
      <StatusBar barStyle={'dark-content'} backgroundColor={Colors.lighter} />
      <View>
        <Text>Please connect to a device</Text>
        <Button icon="menu">Press me 2</Button>
      </View>
      <TouchableOpacity style={styles.button} onPress={scan}>
        <Text>Scan</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={connect}>
        <Text>Connect</Text>
      </TouchableOpacity>
      <View>
        <Text>
          {connectedDevice?.isConnected ? 'Connected!' : 'Not connected...'}
        </Text>
      </View>
      {allDevices.map((device: Device) => (
        <Text>
          {device.name +
            ' ' +
            device.id +
            ' ' +
            (device.serviceUUIDs == null ? '' : device.serviceUUIDs[0])}
        </Text>
      ))}
      <ScrollView />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
  },
});
