import React from 'react';
import {StyleSheet} from 'react-native';
import {Chip} from 'react-native-paper';

interface OnOffChipProps {
  on: boolean;
}

export default function OnOffChip(props: OnOffChipProps) {
  return props.on ? (
    <Chip style={styles.chipOnStyle} textStyle={styles.textStyle}>
      På
    </Chip>
  ) : (
    <Chip style={styles.chipOffStyle} textStyle={styles.textStyle}>
      Av
    </Chip>
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
