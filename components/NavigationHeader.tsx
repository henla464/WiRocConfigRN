import React, {useState} from 'react';

import {StyleSheet, View} from 'react-native';
import {Icon, TouchableRipple} from 'react-native-paper';
import {useWiRocPropertyQuery} from '../hooks/useWiRocPropertyQuery';
import DeviceConnectionModal from './DeviceConnectionModal';

export default function NavigationHeader({deviceId}: {deviceId: string}) {
  const {data: batteryLevel = 0, refetch: refetchBatteryLevel} =
    useWiRocPropertyQuery(deviceId, 'batterylevel');

  const {data: isCharging, refetch: refetchIsCharging} = useWiRocPropertyQuery(
    deviceId,
    'ischarging',
  );

  const {data: ip} = useWiRocPropertyQuery(deviceId, 'ip');

  const isConnected = (ip?.length ?? 0) > 0;

  const batteryLevelRounded = Math.round(batteryLevel / 10) * 10;

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  return (
    <>
      <DeviceConnectionModal
        deviceId={deviceId}
        closeModal={() => {
          setIsModalVisible(false);
        }}
        modalVisible={isModalVisible}
      />
      <View style={styles.container}>
        <View style={styles.iconSpacing}>
          <TouchableRipple
            onPress={() => {
              setIsModalVisible(true);
            }}>
            <Icon
              source={isConnected ? 'wifi-settings' : 'wifi-off'}
              size={40}
            />
          </TouchableRipple>
        </View>
        <TouchableRipple
          onPress={() => {
            refetchBatteryLevel();
            refetchIsCharging();
          }}>
          <Icon
            source={
              !isCharging && batteryLevelRounded === 0
                ? 'battery-alert-variant-outline'
                : batteryLevelRounded === 0
                ? 'battery-charging-10'
                : !isCharging && batteryLevelRounded === 100
                ? 'battery'
                : 'battery-' +
                  (isCharging ? 'charging-' : '') +
                  batteryLevelRounded
            }
            size={40}
          />
        </TouchableRipple>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 8,
  },
  iconSpacing: {
    paddingRight: 25,
  },
  iconButton: {
    padding: 0,
    margin: 0,
  },
});
