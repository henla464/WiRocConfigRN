import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Icon, Text, TouchableRipple} from 'react-native-paper';
//import {useBLEApiContext} from '../context/BLEApiContext';

export default function DeviceHeader() {
  //const BLEAPI = useBLEApiContext();

  const [isDeviceNameModalVisiable, setIsDeviceNameModalVisiable] =
    useState<boolean>(false);

  return (
    <View style={styles.headerRow}>
      <Text style={styles.headerText}>WiRoc Name</Text>
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
