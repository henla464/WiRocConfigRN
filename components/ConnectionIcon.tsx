import React from 'react';
import {ActivityIndicator, Icon} from 'react-native-paper';

interface IConnectionIconProps {
  status?: 'connected' | 'disconnected' | 'connecting';
}
export default function ConnectionIcon(props: IConnectionIconProps) {
  if (!props.status) {
    return null;
  }
  if (props.status === 'connecting') {
    return <ActivityIndicator />;
  }
  return (
    <Icon
      source={props.status === 'connected' ? 'bluetooth-connect' : 'connection'}
      size={50}
      color="#663399"
    />
  );
}
