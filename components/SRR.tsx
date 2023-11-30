import React, {useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {Icon, List, RadioButton, SegmentedButtons} from 'react-native-paper';
import IConfigComponentProps from '../interface/IConfigComponentProps';
import OnOffChip from './OnOffChip';

export default function SRR(compProps: IConfigComponentProps) {
  const [isSRREnabled, setIsSRREnabled] = useState<boolean>(true);
  const [sendReceive, setSendReceive] = useState<string>('RECEIVE');
  return (
    <List.Accordion
      title="SportIdent SRR"
      id={compProps.id}
      right={({isExpanded}) => (
        <View style={styles.accordionHeader}>
          <Text>{sendReceive === 'RECEIVE' ? 'Ta emot' : 'Skicka'}</Text>
          <OnOffChip on={isSRREnabled} />
          {isExpanded ? (
            <Icon source="chevron-up" size={25} />
          ) : (
            <Icon source="chevron-down" size={25} />
          )}
        </View>
      )}>
      <View style={styles.containerColumn}>
        <View style={styles.switchContainer}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              alignItems: 'center',
            }}>
            Aktivera:{' '}
          </Text>
          <Switch
            value={isSRREnabled}
            onValueChange={val => setIsSRREnabled(val)}
          />
        </View>
        <SegmentedButtons
          value={sendReceive}
          onValueChange={setSendReceive}
          buttons={[
            {
              icon: 'login',
              value: 'RECEIVE',
              label: 'Ta emot',
            },
            {
              icon: 'pan-horizontal',
              value: 'SEND',
              label: 'Skicka',
            },
          ]}
        />
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
    paddingBottom: 1,
    backgroundColor: 'lightgray',
    height: 100,
    alignItems: 'center',
  },
  switch: {
    marginLeft: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    alignSelf: 'flex-start',
  },
});
