import React from 'react';
import {View} from 'react-native';
import {Icon} from 'react-native-paper';

interface WarningIconProps {
  size?: number;
}

export default function WarningIcon({size = 24}: WarningIconProps) {
  return (
    <View style={{marginLeft: 6}}>
      <Icon source="alert-outline" size={size} color="#E65100" />
    </View>
  );
}
