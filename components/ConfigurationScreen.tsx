import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {List} from 'react-native-paper';

import {Colors} from 'react-native/Libraries/NewAppScreen';

export default function ConfigurationScreen() {
  return (
    <SafeAreaView style={Colors.lighter}>
      <ScrollView>
        <List.AccordionGroup>
          <View>
            <Text style={styles.header}>Indata</Text>
            <List.Accordion title="USB" id="1">
              <List.Item title="Item 1" />
            </List.Accordion>

            <List.Accordion title="Seriell Bluetooth" id="2">
              <List.Item title="Item 2" />
            </List.Accordion>
            <List.Accordion title="SportIdent SRR" id="2">
              <List.Item title="Item 2" />
            </List.Accordion>
          </View>
          <View>
            <Text style={styles.header}>In- och utdata</Text>
            <List.Accordion title="Lora radio" id="3">
              <List.Item title="Item 1" />
            </List.Accordion>
            <List.Accordion title="Seriell RS232" id="4">
              <List.Item title="Item 2" />
            </List.Accordion>
          </View>
          <View>
            <Text style={styles.header}>Utdata</Text>
            <List.Accordion title="SIRAP-tcp/ip" id="5">
              <List.Item title="Item 3" />
            </List.Accordion>
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
});
