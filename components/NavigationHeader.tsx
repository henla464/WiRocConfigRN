import React, {useEffect, useState} from 'react';

import {Pressable, StyleSheet, View} from 'react-native';
import {Icon, TouchableRipple} from 'react-native-paper';
import {useBLEApiContext} from '../context/BLEApiContext';
import DeviceConnectionModal from './DeviceConnectionModal';

export default function NavigationHeader() {
  const BLEAPI = useBLEApiContext();

  const [batteryLevel, setBatteryLevel] = useState<number>(0);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const [triggerVersion, setTriggerVersion] = useState<number>(0);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const reload = () => {
    setTriggerVersion(currentValue => {
      return currentValue + 1;
    });
  };

  useEffect(() => {
    async function getNavigationHeaderSettings() {
      if (BLEAPI.connectedDevice !== null) {
        setIsConnected(true);
        let pc = BLEAPI.requestProperty(
          BLEAPI.connectedDevice,
          'NavigationHeader',
          'batterylevel',
          (propName: string, propValue: string) => {
            BLEAPI.logDebug(
              'NavigationHeader',
              'useEffect',
              'propName: ' + propName + ' propValue: ' + propValue,
            );

            let batteryLevel1 = parseInt(propValue, 10);
            let battLevel10 = Math.round(batteryLevel1 / 10) * 10;
            setBatteryLevel(battLevel10);
          },
        );
        let pc2 = BLEAPI.requestProperty(
          BLEAPI.connectedDevice,
          'NavigationHeader',
          'ischarging',
          (propName: string, propValue: string) => {
            BLEAPI.logDebug(
              'NavigationHeader',
              'useEffect',
              'propName: ' + propName + ' propValue: ' + propValue,
            );
            setIsCharging(parseInt(propValue, 10) !== 0);
          },
        );
      } else {
        setIsConnected(false);
      }
    }
    getNavigationHeaderSettings();
  }, [BLEAPI, triggerVersion]);

  return (
    <>
      <DeviceConnectionModal
        closeModal={() => {
          setIsModalVisible(false);
        }}
        modalVisible={isModalVisible}
      />
      <View style={styles.container}>
        <View style={styles.iconSpacing}>
          <TouchableRipple
            onPress={() => {
              if (isConnected) {
                setIsModalVisible(true);
              }
            }}>
            <Icon
              source={isConnected ? 'wifi-settings' : 'wifi-off'}
              size={40}
            />
          </TouchableRipple>
        </View>
        <TouchableRipple onPress={() => reload()}>
          <Icon
            source={
              !isCharging && batteryLevel === 0
                ? 'battery-alert-variant-outline'
                : batteryLevel === 0
                ? 'battery-charging-10'
                : !isCharging && batteryLevel === 100
                ? 'battery'
                : 'battery-' + (isCharging ? 'charging-' : '') + batteryLevel
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
