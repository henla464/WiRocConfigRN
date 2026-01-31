import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

interface OnOffChipProps {
  on: boolean;
}

export default function OnOffChip(props: OnOffChipProps) {
  const {colors} = useTheme();
  const {t} = useTranslation();
  return (
    <View
      style={[
        styles.chipStyle,
        {
          backgroundColor: props.on ? '#4CAF50' : colors.surfaceDisabled,
        },
      ]}>
      <Text
        style={[
          styles.textStyle,
          {
            color: props.on ? 'white' : colors.onSurfaceDisabled,
          },
        ]}>
        {props.on ? t('På') : t('Av')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chipStyle: {
    marginLeft: 10,
    padding: 0,
    height: 28,
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 20,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
    padding: 0,
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
