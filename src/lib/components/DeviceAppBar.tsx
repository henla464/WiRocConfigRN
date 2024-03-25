import {useNavigation} from '@react-navigation/native';
import {NativeStackHeaderProps} from '@react-navigation/native-stack';
import React from 'react';
import {View} from 'react-native';
import {Appbar, Text, TouchableRipple} from 'react-native-paper';

import {useActiveWiRocDevice} from '@lib/hooks/useActiveWiRocDevice';
import {useWiRocPropertyQuery} from '@lib/hooks/useWiRocPropertyQuery';

export function DeviceAppBar({options, back}: NativeStackHeaderProps) {
  const navigation = useNavigation();
  const deviceId = useActiveWiRocDevice();
  const {data: deviceName} = useWiRocPropertyQuery(deviceId, 'wirocdevicename');
  return (
    <Appbar.Header
      style={{
        height: 80,
      }}>
      <TouchableRipple onPress={() => navigation.goBack()}>
        <Appbar.BackAction
          {...back}
          style={{paddingTop: 19}}
          onPress={() => {
            navigation.goBack();
          }}
        />
      </TouchableRipple>
      <Appbar.Content
        title={
          <View style={{flexDirection: 'column', alignItems: 'flex-start'}}>
            <Text variant="titleSmall">{deviceName}</Text>
            <Text variant="titleLarge" numberOfLines={1}>
              {options.title}
            </Text>
          </View>
        }
      />
    </Appbar.Header>
  );
}
