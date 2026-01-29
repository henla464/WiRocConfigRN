import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  Checkbox,
  Divider,
  Icon,
  List,
  RadioButton,
  Text,
} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

import {useConfigurationProperty} from '@lib/hooks/useConfigurationProperty';

import {SectionComponentProps} from '../';
import OnOffChip from './OnOffChip';

export default function RS232({
  deviceId,
  onDefaultValuesChange,
}: SectionComponentProps) {
  const {t} = useTranslation();
  const [expanded, setExpanded] = React.useState(false);
  const handlePress = () => setExpanded(!expanded);

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
      title={t('Seriell RS232')}
      id="rs232"
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
          <Text>{sendReceive === 'RECEIVE' ? t('Ta emot') : t('Skicka')}</Text>
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
              label={t('Ta emot')}
              position="leading"
              value="RECEIVE"
            />
            <RadioButton.Item
              label={t('Skicka')}
              position="leading"
              value="SEND"
            />
          </View>
          <View style={styles.containerColumn}>
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
                disabled={sendReceive === 'SEND'}
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
                disabled={!isOneWay && sendReceive === 'RECEIVE'}
              />
            </View>
          </View>
        </RadioButton.Group>
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
  containerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingTop: 1,
    paddingRight: 10,
    paddingBottom: 1,
  },
  containerColumn: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 18,
    paddingTop: 1,
    paddingRight: 10,
    paddingBottom: 1,
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
