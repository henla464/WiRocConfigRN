import React, {useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {Icon, List} from 'react-native-paper';
import IConfigComponentProps from '../interface/IConfigComponentProps';

export default function SIRAP(compProps: IConfigComponentProps) {
  const [isSIRAPSwitchedOn, setIsSIRAPSwitchedOn] = useState<boolean>(false);
  return (
    <List.Accordion
      title="SIRAP-tcp/ip"
      id={compProps.id}
      right={({isExpanded}) => (
        <View style={styles.accordionHeader}>
          <Switch value={isSIRAPSwitchedOn} disabled={true} />
          {isExpanded ? (
            <Icon source="chevron-up" size={25} />
          ) : (
            <Icon source="chevron-down" size={25} />
          )}
        </View>
      )}>
      <View style={styles.container}>
        <View style={styles.switchContainer}>
          <Text>Aktivera: </Text>
          <Switch
            value={isSIRAPSwitchedOn}
            onValueChange={val => setIsSIRAPSwitchedOn(val)}
          />
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
