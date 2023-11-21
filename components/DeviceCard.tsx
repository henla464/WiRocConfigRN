import React from 'react';
import {useState} from 'react';
import {
  Button,
  Card,
  MD3Colors,
  Paragraph,
  ProgressBar,
  Title,
} from 'react-native-paper';
import {StyleSheet} from 'react-native';
import {Device} from 'react-native-ble-plx';

type ConnectFN = (deviceId: Device) => Promise<void>;
interface DeviceCardProps {
  device: Device;
  connect: ConnectFN;
  connectedDevice: Device | null;
}

export default function DeviceCard({
  device,
  connect,
  connectedDevice,
}: DeviceCardProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const cardConnect = async () => {
    await connect(device);
    if (
      (await connectedDevice?.isConnected()) &&
      connectedDevice?.id === device.id
    ) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  };

  // Map the RSSI value to a width between 0 and 1
  let rssiWidth: number = 100; // Used when RSSI is zero or greater.
  let rssi = device.rssi ?? 0;
  if (rssi < -120) {
    rssiWidth = 0;
  } else if (rssi < 0) {
    rssiWidth = 120 + rssi;
    if (rssiWidth > 100) {
      rssiWidth = 100;
    }
  }
  rssiWidth = rssiWidth / 100;

  return (
    <Card style={styles.card} key={device.id}>
      <Card.Content>
        <Title>{device.name}</Title>
        <Paragraph>{device.id}</Paragraph>
        <ProgressBar
          progress={rssiWidth}
          style={styles.progressBar}
          color={MD3Colors.primary30}
        />
      </Card.Content>
      <Card.Actions>
        {isConnected ? '' : <Button onPress={cardConnect}>Anslut</Button>}
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
