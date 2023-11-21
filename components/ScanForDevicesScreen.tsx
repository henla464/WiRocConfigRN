import React from 'react';
import {useState} from 'react';
import {Button} from 'react-native-paper';
import {SafeAreaView, ScrollView, StatusBar, StyleSheet} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import useBLE from '../hooks/useBLE';
import {Device} from 'react-native-ble-plx';
import DeviceCard from './DeviceCard';

export default function ScanForDevicesScreen() {
  const {
    requestPermissions,
    allDevices,
    scanForDevices,
    connectToDevice,
    connectedDevice,
  } = useBLE();

  const [isSearching, setIsSearching] = useState<boolean>(false);

  const scan = async () => {
    if (isSearching) {
      setIsSearching(false);
    } else {
      requestPermissions((isGranted: boolean) => {
        if (isGranted) {
          setIsSearching(true);
          scanForDevices();
        }
      });
    }
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
      <ScrollView>
        <Button
          icon=""
          loading={isSearching}
          mode="contained"
          onPress={scan}
          style={styles.button}>
          {isSearching ? 'Stoppa sökning' : 'Sök WiRoc enheter'}
        </Button>

        {allDevices.map((device: Device) => (
          <DeviceCard
            connect={connect}
            connectedDevice={connectedDevice}
            device={device}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    margin: 10,
  },
});
