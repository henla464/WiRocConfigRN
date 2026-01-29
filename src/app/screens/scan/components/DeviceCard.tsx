import {CommonActions, useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  Button,
  Card,
  MD3Colors,
  Paragraph,
  ProgressBar,
  Title,
} from 'react-native-paper';

import useInterval from '@lib/hooks/useInterval';
import {useNotify} from '@lib/hooks/useNotify';
import {useStore} from '@store';
import {WiRocDevice} from '@store/slices/wiRocDevicesSlice';

interface DeviceCardProps {
  deviceId: string;
}

const RECENTLY_SEEN_TIMEOUT = 10e3;

export default function DeviceCard({deviceId}: DeviceCardProps) {
  const {t} = useTranslation();
  const notify = useNotify();

  const device = useStore(state => state.wiRocDevices[deviceId]);
  const connectDevice = useStore(state => state.connectBleDevice);
  const disconnectDevice = useStore(state => state.disconnectBleDevice);
  const navigation = useNavigation();
  const [now, setNow] = useState(() => Date.now());

  useInterval(() => {
    setNow(Date.now());
  }, 2000);

  if (!device || !device.bleConnection) {
    return null;
  }

  const {name, bleConnection} = device;

  const rssiValue = getRssiValue(device, now);

  return (
    <Card
      style={{
        ...styles.card,
        opacity: rssiValue === 0 ? 0.5 : 1,
      }}>
      <Card.Content
        style={{
          flexDirection: 'row',
          marginRight: 0,
          paddingRight: 6,
          paddingTop: 6,
          paddingBottom: 6,
        }}>
        <View
          style={{
            flex: 2,
            paddingRight: 10,
            paddingBottom: 8,
            paddingTop: 0,
          }}>
          <Title>{name ?? deviceId}</Title>
          <Paragraph>{deviceId}</Paragraph>
          <View
            style={{
              height: 27,
            }}>
            {rssiValue === 0 ? (
              <Paragraph>{t('Tidigare sedd enhet')}</Paragraph>
            ) : (
              <ProgressBar
                progress={getRssiWidth(rssiValue)}
                style={styles.progressBar}
                color={MD3Colors.primary30}
              />
            )}
          </View>
        </View>
        <View style={{justifyContent: 'center', paddingRight: 0, width: 130}}>
          <Button
            mode="outlined"
            loading={bleConnection.status === 'connecting'}
            onPress={async () => {
              if (bleConnection.status === 'connected') {
                disconnectDevice(deviceId);
              } else {
                try {
                  await connectDevice(deviceId);
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{name: 'Device', params: {deviceId}}],
                    }),
                  );
                } catch (err) {
                  notify({
                    type: 'error',
                    message:
                      t('Kunde inte ansluta till enheten: ') +
                      (err instanceof Error ? err.message : t('Okänt fel')),
                  });
                }
              }
            }}>
            {bleConnection.status === 'connected'
              ? t('Koppla från')
              : t('Anslut')}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  progressBar: {
    marginTop: 5,
    height: 10,
  },
  card: {
    backgroundColor: 'lightgrey',
    marginLeft: 11,
    marginRight: 11,
    marginTop: 8,
    marginBottom: 2,
    padding: 0,
  },
});

function getRssiValue(device: WiRocDevice, now: number) {
  if (now - device.lastSeen > RECENTLY_SEEN_TIMEOUT) {
    return 0;
  }

  return device.bleConnection?.rssi ?? 0;
}

function getRssiWidth(rssi: number) {
  let rssiWidth: number = 100; // Used when RSSI is zero or greater.
  if (rssi < -120) {
    rssiWidth = 0;
  } else if (rssi < 0) {
    rssiWidth = 120 + rssi;
    if (rssiWidth > 100) {
      rssiWidth = 100;
    }
  }
  return Math.round(rssiWidth / 100);
}
