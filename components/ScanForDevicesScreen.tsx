import React from 'react';
import {useState} from 'react';
import {Button} from 'react-native-paper';
import {SafeAreaView, ScrollView, StatusBar, StyleSheet} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {Device} from 'react-native-ble-plx';
import DeviceCard from './DeviceCard';
import {useBLEApiContext} from '../context/BLEApiContext';
import ErrorBanner from './ErrorBanner';

export default function ScanForDevicesScreen() {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const BLEAPI = useBLEApiContext();

  const scan = async () => {
    if (isSearching) {
      console.log('Stop scan');
      setIsSearching(false);
      BLEAPI.stopScanningForDevices();
    } else {
      console.log('Start scan');
      BLEAPI.requestPermissions((isGranted: boolean) => {
        console.log('Start scan 2');
        if (isGranted) {
          console.log('Start scan 3');
          setIsSearching(true);
          console.log('Start scan 4');
          BLEAPI.scanForDevices();
        }
      });
    }
  };

  return (
    <SafeAreaView style={Colors.lighter}>
      <StatusBar barStyle={'dark-content'} backgroundColor={Colors.lighter} />
      <ErrorBanner />
      <ScrollView>
        <Button
          icon=""
          loading={isSearching}
          mode="contained"
          onPress={scan}
          style={styles.button}>
          {isSearching ? 'Stoppa sökning' : 'Sök WiRoc enheter'}
        </Button>

        {BLEAPI.allDevices.map((device: Device) => (
          <DeviceCard device={device} key={'deviceCard-' + device.id} />
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
