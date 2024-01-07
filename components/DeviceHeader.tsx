import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Icon, Text, TouchableRipple} from 'react-native-paper';
import EditDeviceNameModal from './EditDeviceNameModal';
import {useBLEApiContext} from '../context/BLEApiContext';

export default function DeviceHeader() {
  const BLEAPI = useBLEApiContext();

  const [isDeviceNameModalVisiable, setIsDeviceNameModalVisiable] =
    useState<boolean>(false);
  const [deviceName, setDeviceName] = useState<string>('');

  const updateFromWiRoc = (propName: string, propValue: string) => {
    console.log(
      'DeviceHeader:updateFromWiRoc: propName: ' +
        propName +
        ' propValue: ' +
        propValue,
    );
    switch (propName) {
      case 'wirocdevicename':
        setDeviceName(propValue);
        break;
    }
  };

  useEffect(() => {
    async function getDeviceHeaderSettings() {
      if (BLEAPI.connectedDevice !== null) {
        let pc = BLEAPI.requestProperty(
          BLEAPI.connectedDevice,
          'DeviceHeader',
          'wirocdevicename',
          updateFromWiRoc,
        );
      }
    }

    getDeviceHeaderSettings();
  }, [BLEAPI]);

  return (
    <View style={styles.headerRow}>
      <EditDeviceNameModal
        modalVisible={isDeviceNameModalVisiable}
        closeModal={function (): void {
          setIsDeviceNameModalVisiable(false);
        }}
        saveSetting={function (newDeviceName: string): void {
          if (BLEAPI.connectedDevice !== null) {
            BLEAPI.saveProperty(
              BLEAPI.connectedDevice,
              'DeviceHeader',
              'wirocdevicename',
              newDeviceName,
              updateFromWiRoc,
            );
            setIsDeviceNameModalVisiable(false);
          }
        }}
        deviceName={deviceName}
      />
      <Text style={styles.headerText}>{deviceName}</Text>
      <View style={styles.iconSpacing}>
        <TouchableRipple
          onPress={() => {
            setIsDeviceNameModalVisiable(true);
          }}>
          <Icon source="pen" size={45} />
        </TouchableRipple>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    height: 45,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSpacing: {
    paddingLeft: 10,
  },
  headerText: {
    fontSize: 30,
  },
});
