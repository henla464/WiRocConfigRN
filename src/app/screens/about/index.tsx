import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

export default function AboutScreen() {
  return (
    <SafeAreaView style={Colors.lighter}>
      <ScrollView>
        <View style={styles.containerColumn}>
          <Text style={{fontSize: 30, fontWeight: 'bold', paddingTop: 14}}>
            WiRoc Config
          </Text>
          <Text style={{fontSize: 20, fontWeight: 'bold', paddingTop: 14}}>
            Version 15
          </Text>
        </View>
        <View style={styles.containerColumn}>
          <Text style={{fontSize: 20, fontWeight: 'bold', paddingTop: 14}}>
            Särskilt tack till Björn Norrliden som utvecklat mycket av denna
            mobilapp.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingTop: 1,
    paddingRight: 10,
    paddingBottom: 1,
    backgroundColor: 'lightgray',
  },
  containerColumn: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 10,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    backgroundColor: 'lightgray',

    alignItems: 'center',
  },
});
