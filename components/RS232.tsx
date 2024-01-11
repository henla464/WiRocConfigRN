import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Checkbox, Icon, List, RadioButton} from 'react-native-paper';
import OnOffChip from './OnOffChip';
import {SectionComponentProps} from './ConfigurationScreen';
import {useConfigurationProperty} from '../hooks/useConfigurationProperty';

export default function RS232({
  deviceId,
  onDefaultValuesChange,
}: SectionComponentProps) {
  const [
    {
      field: {value: sendReceive, onChange: setSendReceive},
    },
  ] = useConfigurationProperty(deviceId, 'rs232mode', onDefaultValuesChange);

  const [
    {
      field: {value: isOneWay, onChange: setIsOneWay},
    },
  ] = useConfigurationProperty(
    deviceId,
    'rs232onewayreceive',
    onDefaultValuesChange,
  );
  const [
    {
      field: {value: is4800bps, onChange: setIs4800bps},
    },
  ] = useConfigurationProperty(
    deviceId,
    'forcers2324800baudrate',
    onDefaultValuesChange,
  );

  return (
    <List.Accordion
      title="Seriell RS232"
      id="rs232"
      right={({isExpanded}) => (
        <View style={styles.accordionHeader}>
          <Text>{sendReceive === 'RECEIVE' ? 'Ta emot' : 'Skicka'}</Text>
          <OnOffChip on={true} />
          {isExpanded ? (
            <Icon source="chevron-up" size={25} />
          ) : (
            <Icon source="chevron-down" size={25} />
          )}
        </View>
      )}>
      <RadioButton.Group
        onValueChange={newValue => {
          setSendReceive(newValue);
          setIs4800bps(false);
          if (newValue === 'SEND') {
            setIsOneWay(false);
          }
        }}
        value={sendReceive}>
        <View style={styles.containerRow}>
          <RadioButton.Item
            label="Ta emot"
            position="leading"
            value="RECEIVE"
          />
          <RadioButton.Item label="Skicka" position="leading" value="SEND" />
        </View>
        <View style={styles.containerColumn}>
          <View style={styles.mainCheckBoxContainer}>
            <Checkbox.Item
              label="Envägs, lyssna passivt"
              position="leading"
              status={isOneWay ? 'checked' : 'unchecked'}
              onPress={() => {
                if (isOneWay) {
                  setIs4800bps(false);
                }
                setIsOneWay(!isOneWay);
              }}
              disabled={sendReceive === 'SEND'}
              labelStyle={styles.checkBoxLabel}
            />
          </View>
          <View style={styles.secondaryCheckBoxContainer}>
            <Checkbox.Item
              label="Använd 4800 bps"
              position="leading"
              status={is4800bps ? 'checked' : 'unchecked'}
              onPress={() => setIs4800bps(!is4800bps)}
              labelStyle={styles.checkBoxLabel}
              disabled={!isOneWay && sendReceive === 'RECEIVE'}
            />
          </View>
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
  containerRow: {
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
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 18,
    paddingTop: 1,
    paddingRight: 10,
    paddingBottom: 1,
    backgroundColor: 'lightgray',
  },
  mainCheckBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    margin: 0,
  },
  secondaryCheckBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 0,
  },
  checkBoxLabel: {
    marginLeft: 5,
  },
});
