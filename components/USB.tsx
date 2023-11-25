import React from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {Checkbox, Icon, List} from 'react-native-paper';
import IConfigComponentProps from '../interface/IConfigComponentProps';

export default function USB(compProps: IConfigComponentProps) {
  return (
    <List.Accordion
      title="USB"
      id={compProps.id}
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
      <View style={styles.container}>
        <View style={styles.switchContainer}>
          <Text>Envägs, bara ta emot: </Text>
          <Checkbox status="checked" />
        </View>
      </View>
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
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 18,
    paddingTop: 1,
    paddingRight: 10,
    paddingBottom: 1,
    backgroundColor: 'lightgray',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switch: {
    marginLeft: 10,
  },
});
