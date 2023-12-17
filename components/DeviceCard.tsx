import React, {useEffect} from 'react';
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
import {useBLEApiContext} from '../context/BLEApiContext';
import {useNavigation} from '@react-navigation/native';

interface DeviceCardProps {
  device: Device;
}

export default function DeviceCard({device}: DeviceCardProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const BLEAPI = useBLEApiContext();

  const cardConnect = async () => {
    setIsConnecting(true);
    await BLEAPI.connectToDevice(device);
    setIsConnecting(false);
    /*if (await device?.isConnected()) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }*/
  };

  const cardDisconnect = async () => {
    await BLEAPI.disconnectDevice(device);
  };

  const navigation = useNavigation();

  useEffect(() => {
    setIsConnected(device.id === BLEAPI.connectedDevice?.id);
  }, [device.id, BLEAPI.connectedDevice?.id]);

  useEffect(() => {
    if (isConnected) {
      navigation.navigate('Device' as never);
    }
  }, [isConnected, navigation]);

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
        <Button
          loading={isConnecting}
          onPress={isConnected ? cardDisconnect : cardConnect}>
          {isConnected ? 'Koppla från' : 'Anslut'}
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
