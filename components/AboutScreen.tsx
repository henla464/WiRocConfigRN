import React from 'react';
import {SafeAreaView, ScrollView, Text} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

export default function AboutScreen() {
  return (
    <SafeAreaView style={Colors.lighter}>
      <ScrollView>
        <Text>WiRoc Config</Text>
        <Text>Version 10</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
