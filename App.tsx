import React from 'react';
import {useState} from 'react';
import {Button} from 'react-native-paper';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import useBLE from './Hooks/useBLE';
import DeviceModal from './Components/DeviceConnectionModal';
import {Device} from 'react-native-ble-plx';

function App(): JSX.Element {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const hideModal = () => {
    setIsModalVisible(false);
  };
  const {requestPermissions, allDevices, scanForDevices} = useBLE();
  const openModal = async () => {
    requestPermissions((isGranted: boolean) => {
      if (isGranted) {
        scanForDevices();
        setIsModalVisible(true);
      }
    });
  };

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <DeviceModal closeModal={hideModal} modalVisible={isModalVisible} />
      <View>
        <Text>Please connect to a device</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={openModal}>
        <Text>Press Here</Text>
      </TouchableOpacity>
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

export default App;
