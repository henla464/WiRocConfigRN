import React from 'react';
import {StyleSheet} from 'react-native';
import {Chip} from 'react-native-paper';

interface ConnectedProps {
  connected: boolean;
}

export default function ConnectedChip(props: ConnectedProps) {
  return props.connected ? (
    <Chip style={styles.chipOnStyle} textStyle={styles.textStyle}>
      Ansluten
    </Chip>
  ) : (
    <></>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  chipOnStyle: {
    backgroundColor: 'green',
    marginLeft: 10,
    padding: 0,
    height: 29,
  },
  chipOffStyle: {
    backgroundColor: '#d00000',
    marginLeft: 10,
    padding: 0,
    height: 29,
  },
});
