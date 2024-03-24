import {CommonActions, useNavigation} from '@react-navigation/native';
import React from 'react';
import {StyleSheet} from 'react-native';
import {
  Button,
  Card,
  MD3Colors,
  Paragraph,
  ProgressBar,
  Title,
} from 'react-native-paper';

import {useNotify} from '@lib/hooks/useNotify';
import {useStore} from '@store';

interface DeviceCardProps {
  deviceId: string;
}

export default function DeviceCard({deviceId}: DeviceCardProps) {
  const notify = useNotify();

  const bleConnection = useStore(
    state => state.wiRocDevices[deviceId].bleConnection,
  );
  const connectDevice = useStore(state => state.connectBleDevice);
  const disconnectDevice = useStore(state => state.disconnectBleDevice);
  const navigation = useNavigation();

  if (!bleConnection) {
    return null;
  }

  console.log(
    'DeviceCard: ' + bleConnection.name + ' ' + deviceId,
    bleConnection,
  );

  return (
    <Card
      style={{
        ...styles.card,
        opacity: bleConnection.rssi === null ? 0.5 : 1,
      }}>
      <Card.Content>
        <Title>{bleConnection.name ?? deviceId}</Title>
        <Paragraph>{deviceId}</Paragraph>
        {bleConnection.rssi === null ? (
          <Paragraph>Previously seen device</Paragraph>
        ) : (
          <ProgressBar
            progress={getRssiWidth(bleConnection.rssi ?? 0)}
            style={styles.progressBar}
            color={MD3Colors.primary30}
          />
        )}
      </Card.Content>
      <Card.Actions>
        <Button
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
                  message: `Kunde inte ansluta till enheten: ${
                    err instanceof Error ? err.message : 'Okänt fel'
                  }`,
                });
              }
            }
          }}>
          {bleConnection.status === 'connected' ? 'Koppla från' : 'Anslut'}
        </Button>
      </Card.Actions>
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
  return rssiWidth / 100;
}
