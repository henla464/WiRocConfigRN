import React, {useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {Icon, List} from 'react-native-paper';

export default function SIRAP() {
  const [isSIRAPSwitchedOn, setIsSIRAPSwitchedOn] = useState<boolean>(false);
  return (
    <List.Accordion
      title="SIRAP-tcp/ip"
      id="5"
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
      <List.Item title="Item 3" />
      <Text>Aktivera: </Text>
      <Switch
        value={isSIRAPSwitchedOn}
        onValueChange={val => setIsSIRAPSwitchedOn(val)}
      />
    </List.Accordion>
  );
}

const styles = StyleSheet.create({
  accordionHeader: {
    flexDirection: 'row',
  },
});
