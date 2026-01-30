import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Checkbox, Divider, Icon, List} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

import {useConfigurationProperty} from '@lib/hooks/useConfigurationProperty';

import {SectionComponentProps} from '../';
import OnOffChip from './OnOffChip';

export default function USB({
  deviceId,
  onDefaultValuesChange,
}: SectionComponentProps) {
  const {t} = useTranslation();
  const [expanded, setExpanded] = React.useState(false);
  const handlePress = () => setExpanded(!expanded);

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
      title={t('USB')}
      id="usb"
      expanded={expanded}
      onPress={handlePress}
      theme={{
        colors: {
          primary: 'black',
          background: expanded ? 'orange' : 'rgb(255, 251, 255)',
        },
      }}
      style={{
        backgroundColor: 'rgb(255, 251, 255)',
        marginLeft: 10,
      }}
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
      <Divider bold={true} />
      <View style={styles.container}>
        <View style={styles.mainCheckBoxContainer}>
          <Checkbox.Item
            label={t('Envägs, lyssna passivt')}
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
            label={t('Använd 4800 bps')}
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
    backgroundColor: 'rgb(255, 251, 255)',
    marginLeft: 10,
  },
  mainCheckBoxContainer: {
    alignItems: 'flex-start',
  },
  secondaryCheckBoxContainer: {
    alignItems: 'flex-start',
    paddingLeft: 25,
  },
  checkBoxLabel: {
    marginLeft: 5,
  },
});
