import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Checkbox, Icon, List} from 'react-native-paper';

import {useConfigurationProperty} from '@lib/hooks/useConfigurationProperty';

import {SectionComponentProps} from '../';
import OnOffChip from './OnOffChip';

export default function USB({
  deviceId,
  onDefaultValuesChange,
}: SectionComponentProps) {
  const [
    {
      field: {value: isOneWay, onChange: setIsOneWay},
    },
  ] = useConfigurationProperty(
    deviceId,
    'onewayreceive',
    onDefaultValuesChange,
  );
  const [
    {
      field: {value: is4800bps, onChange: setIs4800bps},
    },
  ] = useConfigurationProperty(
    deviceId,
    'force4800baudrate',
    onDefaultValuesChange,
  );

  return (
    <List.Accordion
      title="USB"
      id="usb"
      right={({isExpanded}) => (
        <View style={styles.accordionHeader}>
          <OnOffChip on={true} />
          {isExpanded ? (
            <Icon source="chevron-up" size={25} />
          ) : (
            <Icon source="chevron-down" size={25} />
          )}
        </View>
      )}>
      <View style={styles.container}>
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
            disabled={!isOneWay}
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
    paddingLeft: 25,
  },
  checkBoxLabel: {
    marginLeft: 5,
  },
});
