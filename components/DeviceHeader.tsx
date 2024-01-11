import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Icon, Text, TouchableRipple} from 'react-native-paper';
import EditDeviceNameModal from './EditDeviceNameModal';
import {
  useWiRocPropertyMutation,
  useWiRocPropertyQuery,
} from '../hooks/useWiRocPropertyQuery';

export default function DeviceHeader({deviceId}: {deviceId: string}) {
  const {data: deviceName} = useWiRocPropertyQuery(deviceId, 'wirocdevicename');
  const {mutate: mutateDeviceName} = useWiRocPropertyMutation(
    deviceId,
    'wirocdevicename',
  );

  const [isDeviceNameModalVisiable, setIsDeviceNameModalVisiable] =
    useState<boolean>(false);

  return (
    <View style={styles.headerRow}>
      <EditDeviceNameModal
        modalVisible={isDeviceNameModalVisiable}
        closeModal={function (): void {
          setIsDeviceNameModalVisiable(false);
        }}
        saveSetting={function (newDeviceName: string): void {
          mutateDeviceName(newDeviceName);
          setIsDeviceNameModalVisiable(false);
        }}
        deviceName={deviceName ?? ''}
      />
      <Text style={styles.headerText}>{deviceName ?? ''}</Text>
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
