import React, {useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {Icon, List, RadioButton} from 'react-native-paper';
import IConfigComponentProps from '../interface/IConfigComponentProps';

export default function SRR(compProps: IConfigComponentProps) {
  const [sendReceive, setSendReceive] = useState<string>('RECEIVE');
  return (
    <List.Accordion
      title="SportIdent SRR"
      id={compProps.id}
      right={({isExpanded}) => (
        <View style={styles.accordionHeader}>
          <Text>{sendReceive === 'RECEIVE' ? 'Ta emot' : 'Skicka'}</Text>
          <Switch value={true} disabled={true} />
          {isExpanded ? (
            <Icon source="chevron-up" size={25} />
          ) : (
            <Icon source="chevron-down" size={25} />
          )}
        </View>
      )}>
      <RadioButton.Group
        onValueChange={newValue => setSendReceive(newValue)}
        value={sendReceive}>
        <View style={styles.container}>
          <Text>Ta emot</Text>
          <RadioButton value="RECEIVE" />
          <Text>Skicka</Text>
          <RadioButton value="SEND" />
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
