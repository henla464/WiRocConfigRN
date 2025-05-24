import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.containerColumn}>
          <Text style={{fontSize: 30, fontWeight: 'bold', paddingTop: 14}}>
            WiRoc Config
          </Text>
          <Text style={{fontSize: 20, fontWeight: 'bold', paddingTop: 14}}>
            Version 18
          </Text>
        </View>
        <View style={styles.containerColumn}>
          <Text style={{fontSize: 20, fontWeight: 'bold', paddingTop: 14}}>
            Särskilt tack till Björn Norrliden som utvecklat mycket av denna
            mobilapp.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 18,
    paddingTop: 1,
    paddingRight: 10,
    paddingBottom: 1,
    backgroundColor: 'rgb(255, 251, 255)',
  },
  containerColumn: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 10,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
});
