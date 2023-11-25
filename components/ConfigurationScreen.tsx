import React, {useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Icon, Switch, List} from 'react-native-paper';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import SIRAP from './SIRAP';

export default function ConfigurationScreen() {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  return (
    <SafeAreaView style={Colors.lighter}>
      <ScrollView>
        <List.AccordionGroup>
          <View>
            <Text style={styles.header}>Indata</Text>
            <List.Accordion
              title="USB"
              id="1"
              right={({isExpanded}) => (
                <View style={styles.accordionHeader}>
                  <Switch value={true} disabled={true} />
                  {isExpanded ? (
                    <Icon source="chevron-up" size={25} />
                  ) : (
                    <Icon source="chevron-down" size={25} />
                  )}
                </View>
              )}>
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
            <SIRAP />
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
  },
});
