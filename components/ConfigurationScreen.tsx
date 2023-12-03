import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Divider, List} from 'react-native-paper';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import SIRAP from './SIRAP';
import RS232 from './RS232';
import USB from './USB';
import SerialBluetooth from './SerialBluetooth';
import LoraRadio from './LoraRadio';
import SRR from './SRR';

export default function ConfigurationScreen() {
  //let s = SerialBluetooth({id: 2});

  return (
    <SafeAreaView style={Colors.lighter}>
      <ScrollView>
        <List.AccordionGroup>
          <View>
            <Divider bold={true} />
            <Text style={styles.header}>Indata</Text>
            <Divider bold={true} />
            <USB id={1} />
            <SerialBluetooth id={2} />
            <SRR id={3} />
          </View>
          <View>
            <Divider bold={true} />
            <Text style={styles.header}>In- och utdata</Text>
            <Divider bold={true} />
            <LoraRadio id={4} />
            <RS232 id={5} />
          </View>
          <View>
            <Divider bold={true} />
            <Text style={styles.header}>Utdata</Text>
            <Divider bold={true} />
            <SIRAP id={6} />
          </View>
        </List.AccordionGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 10,
    fontWeight: 'bold',
    fontSize: 20,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
