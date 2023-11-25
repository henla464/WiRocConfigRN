import React from 'react';

import {StyleSheet, View} from 'react-native';
import {Icon} from 'react-native-paper';

export default function NavigationHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.iconSpacing}>
        <Icon source="pen" size={40} />
      </View>
      <View style={styles.iconSpacing}>
        <Icon source="wifi-settings" size={40} />
      </View>

      <Icon source="battery-10" size={40} />
    </View>
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
});
