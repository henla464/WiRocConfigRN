import React from 'react';
import {SafeAreaView, ScrollView, StatusBar, StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';
import {useShallow} from 'zustand/react/shallow';

import {Notifications} from '@lib/components/Notifications';
import {useStore} from '@store';

import DeviceCard from './components/DeviceCard';

export default function ScanForDevicesScreen() {
  const deviceIds = useStore(
    useShallow(state => Object.keys(state.wiRocDevices)),
  );

  return (
    <SafeAreaView>
      <StatusBar barStyle={'dark-content'} />
      <Notifications />
      <ScrollView>
        <ScanButton />
        {deviceIds.map(deviceId => (
          <DeviceCard deviceId={deviceId} key={deviceId} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const ScanButton = () => {
  const startScan = useStore(state => state.startBleScan);
  const stopScan = useStore(state => state.stopBleScan);
  const isScanning = useStore(state => state.isScanning);
  return (
    <Button
      icon=""
      loading={isScanning}
      mode="contained"
      onPress={isScanning ? stopScan : startScan}
      style={styles.button}>
      {isScanning ? 'Stoppa sökning' : 'Sök WiRoc enheter'}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    margin: 10,
  },
});
