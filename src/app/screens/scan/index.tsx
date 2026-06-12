import React from 'react';
import {ScrollView, StatusBar, StyleSheet, SafeAreaView, View, Text} from 'react-native';
import {Button} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useShallow} from 'zustand/react/shallow';

import {Notifications} from '@lib/components/Notifications';
import {useStore} from '@store';

import DeviceCard from './components/DeviceCard';

const RECENTLY_SEEN_TIMEOUT = 10_000;

export default function ScanForDevicesScreen() {
  const {t} = useTranslation();
  const devices = useStore(useShallow(state => state.wiRocDevices));
  const now = Date.now();

  // Group devices:
  // 1. Available — recently seen (connectable)
  // 2. Connected — not recently seen, but actively connected
  // 3. Not found — not recently seen and not connected
  const available: string[] = [];
  const connected: string[] = [];
  const notFound: string[] = [];

  for (const [deviceId, device] of Object.entries(devices)) {
    const isRecentlySeen = now - device.lastSeen <= RECENTLY_SEEN_TIMEOUT;
    const isConnected = device.bleConnection?.status === 'connected';

    if (isConnected) {
      connected.push(deviceId);
    } else if (isRecentlySeen) {
      available.push(deviceId);
    } else {
      notFound.push(deviceId);
    }
  }

  const sortByName = (a: string, b: string) => {
    const aName = (devices[a]?.name ?? '').toLowerCase();
    const bName = (devices[b]?.name ?? '').toLowerCase();
    return aName.localeCompare(bName);
  };

  available.sort(sortByName);
  connected.sort(sortByName);
  notFound.sort(sortByName);

  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar barStyle={'dark-content'} />
      <Notifications />
      <ScanButton />
      <ScrollView contentContainerStyle={{paddingBottom: 10}}>
        {available.length > 0 && (
          <>
            <SectionLabel label={t('Tillgängliga enheter')} />
            {available.map(deviceId => (
              <DeviceCard deviceId={deviceId} key={deviceId} />
            ))}
          </>
        )}
        {connected.length > 0 && (
          <>
            <SectionLabel label={t('Anslutna enheter')} />
            {connected.map(deviceId => (
              <DeviceCard deviceId={deviceId} key={deviceId} />
            ))}
          </>
        )}
        {notFound.length > 0 && (
          <>
            <SectionLabel label={t('Ej hittade enheter')} />
            {notFound.map(deviceId => (
              <DeviceCard deviceId={deviceId} key={deviceId} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const SectionLabel = ({label}: {label: string}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{label}</Text>
  </View>
);

const ScanButton = () => {
  const {t} = useTranslation();
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
      {isScanning ? t('Stoppa sökning') : t('Sök WiRoc enheter')}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    margin: 10,
  },
  sectionHeader: {
    marginTop: 16,
    marginLeft: 16,
    marginBottom: 4,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
