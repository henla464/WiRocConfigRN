import React, {useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {Icon, List, RadioButton} from 'react-native-paper';
import IConfigComponentProps from '../interface/IConfigComponentProps';

export default function LoraRadio(compProps: IConfigComponentProps) {
  const [loraMode, setLoraMode] = useState<string>('RECEIVER');
  return (
    <List.Accordion
      title="Lora Radio"
      id={compProps.id}
      right={({isExpanded}) => (
        <View style={styles.accordionHeader}>
          <Text>
            {loraMode === 'RECEIVER'
              ? 'Mottagare'
              : loraMode === 'SENDER'
              ? 'Sändare'
              : 'Repeater'}
          </Text>
          <Switch value={true} disabled={true} />
          {isExpanded ? (
            <Icon source="chevron-up" size={25} />
          ) : (
            <Icon source="chevron-down" size={25} />
          )}
        </View>
      )}>
      <RadioButton.Group
        onValueChange={newValue => setLoraMode(newValue)}
        value={loraMode}>
        <View style={styles.container}>
          <Text>Mottagare</Text>
          <RadioButton value="RECEIVER" />
          <Text>Sändare</Text>
          <RadioButton value="SENDER" />
          <Text>Repeater</Text>
          <RadioButton value="REPEATER" />
        </View>
      </RadioButton.Group>
    </List.Accordion>
  );
}

const styles = StyleSheet.create({
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  switch: {
    marginLeft: 10,
  },
});
