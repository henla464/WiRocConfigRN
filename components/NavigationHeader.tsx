import React, {useState} from 'react';

import {StyleSheet, View} from 'react-native';
import {IconButton} from 'react-native-paper';
import {
  useWiRocPropertyMutation,
  useWiRocPropertyQuery,
} from '../hooks/useWiRocPropertyQuery';
import DeviceConnectionModal from './DeviceConnectionModal';
import EditDeviceNameModal from './EditDeviceNameModal';

export default function NavigationHeader({deviceId}: {deviceId: string}) {
  const {data: batteryLevel = 0, refetch: refetchBatteryLevel} =
    useWiRocPropertyQuery(deviceId, 'batterylevel');

  const {data: isCharging, refetch: refetchIsCharging} = useWiRocPropertyQuery(
    deviceId,
    'ischarging',
  );

  const {data: ip} = useWiRocPropertyQuery(deviceId, 'ip');

  const {data: deviceName} = useWiRocPropertyQuery(deviceId, 'wirocdevicename');
  const {mutate: mutateDeviceName} = useWiRocPropertyMutation(
    deviceId,
    'wirocdevicename',
  );

  const isConnected = (ip?.length ?? 0) > 0;

  const batteryLevelRounded = Math.round(batteryLevel / 10) * 10;

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [isDeviceNameModalVisiable, setIsDeviceNameModalVisiable] =
    useState<boolean>(false);

  return (
    <>
      <DeviceConnectionModal
        deviceId={deviceId}
        closeModal={() => {
          setIsModalVisible(false);
        }}
        modalVisible={isModalVisible}
      />
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
      <View style={styles.container}>
        <IconButton
          icon="pen"
          onPress={() => {
            setIsDeviceNameModalVisiable(true);
          }}
        />
        <IconButton
          icon={isConnected ? 'wifi-settings' : 'wifi-off'}
          onPress={() => {
            setIsModalVisible(true);
          }}
        />
        <IconButton
          icon={
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
          onPress={() => {
            refetchBatteryLevel();
            refetchIsCharging();
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
