import React from 'react';
import {Icon} from 'react-native-paper';

interface IConnectionIconProps {
  isConnected: boolean;
}
export default function ConnectionIcon(props: IConnectionIconProps) {
  return (
    <Icon
      source={props.isConnected ? 'bluetooth-connect' : 'connection'}
      size={50}
      color="#663399"
    />
  );
}
