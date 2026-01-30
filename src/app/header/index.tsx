import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {IconButton, Portal, Snackbar} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

import {
  useWiRocPropertyMutation,
  useWiRocPropertyQuery,
} from '@lib/hooks/useWiRocPropertyQuery';

import EditDeviceNameModal from './components/EditDeviceNameModal';

export default function NavigationHeader({deviceId}: {deviceId: string}) {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const {data: batteryLevel = 0, refetch: refetchBatteryLevel} =
    useWiRocPropertyQuery(deviceId, 'batterylevel');

  const {data: isCharging, refetch: refetchIsCharging} = useWiRocPropertyQuery(
    deviceId,
    'ischarging',
  );

  const {data: ip} = useWiRocPropertyQuery(deviceId, 'ip');
  const {data: wifiNetworks = []} = useWiRocPropertyQuery(deviceId, 'listwifi');

  const {data: deviceName} = useWiRocPropertyQuery(deviceId, 'wirocdevicename');
  const {mutate: mutateDeviceName} = useWiRocPropertyMutation(
    deviceId,
    'wirocdevicename',
  );

  const isConnected =
    (ip?.length ?? 0) > 0 && wifiNetworks.some(n => n.isConnected);

  const batteryLevelRounded = Math.round(batteryLevel / 10) * 10;

  const [isDeviceNameModalVisiable, setIsDeviceNameModalVisiable] =
    useState<boolean>(false);

  const [isBatteryLevelSnackbarVisible, setBatteryLevelSnackbarVisible] =
    useState(false);
  const snackbarText = `${t('Enhetens batterinivå:')} ${batteryLevelRounded}%`;

  return (
    <>
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
            navigation.navigate('DeviceNetwork', {deviceId});
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
            setBatteryLevelSnackbarVisible(true);
          }}
        />
      </View>
      <Portal>
        <Snackbar
          visible={isBatteryLevelSnackbarVisible}
          onDismiss={() => setBatteryLevelSnackbarVisible(false)}
          action={{
            label: 'OK',
            onPress: () => {
              setBatteryLevelSnackbarVisible(false);
            },
          }}
          duration={4000}>
          {snackbarText}
        </Snackbar>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
