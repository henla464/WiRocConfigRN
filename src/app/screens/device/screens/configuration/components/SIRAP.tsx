import React from 'react';
import {useFormContext} from 'react-hook-form';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {
  Divider,
  HelperText,
  Icon,
  List,
  TextInput,
  Switch,
  Text,
} from 'react-native-paper';

import {useConfigurationProperty} from '@lib/hooks/useConfigurationProperty';

import {SectionComponentProps} from '../';
import OnOffChip from './OnOffChip';

const ipAddressRegex =
  /^((?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])[.]){3}(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/;

export default function SIRAP({
  deviceId,
  onDefaultValuesChange,
}: SectionComponentProps) {
  const {t} = useTranslation();
  const [expanded, setExpanded] = React.useState(false);
  const handlePress = () => setExpanded(!expanded);

  const form = useFormContext();
  const [
    {
      field: {value: isSIRAPSwitchedOn, onChange: setIsSIRAPSwitchedOn},
    },
  ] = useConfigurationProperty(
    deviceId,
    'sendtosirapenabled',
    onDefaultValuesChange,
  );

  const [
    {
      field: {value: ipAddress, onChange: setIpAddress},
      fieldState: ipAddressFieldState,
    },
  ] = useConfigurationProperty(
    deviceId,
    'sendtosirapip',
    onDefaultValuesChange,
    {
      rules: {
        pattern: {
          value: ipAddressRegex,
          message: t('Ogiltig IP-adress'),
        },
        required: {
          value: isSIRAPSwitchedOn,
          message: t('IP-adress krävs när SIRAP är aktiverat'),
        },
      },
    },
  );

  const [
    {
      field: {value: ipPort, onChange: setIpPort},
      fieldState: ipPortFieldState,
    },
  ] = useConfigurationProperty(
    deviceId,
    'sendtosirapipport',
    onDefaultValuesChange,
    {
      rules: {
        required: {
          value: isSIRAPSwitchedOn,
          message: t('IP-port krävs när SIRAP är aktiverat'),
        },
        pattern: {
          value: /^[^0]\d*$/,
          message: t('Ogiltigt portnummer'),
        },
        validate: {
          value: value => {
            const number = parseInt(value, 10);
            if (number < 1 || number > 65535) {
              return t('Ogiltigt portnummer');
            }
          },
        },
      },
    },
  );

  return (
    <List.Accordion
      title={t('SIRAP-tcp/ip')}
      id="sirap"
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
          <OnOffChip on={isSIRAPSwitchedOn} />
          {isExpanded ? (
            <Icon source="chevron-up" size={25} />
          ) : (
            <Icon source="chevron-down" size={25} />
          )}
        </View>
      )}>
      <Divider bold={true} />
      <View style={styles.container}>
        <View style={styles.switchContainer}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              alignItems: 'center',
              paddingBottom: 8,
            }}>
            {t('Aktivera')}:{' '}
          </Text>
          <Switch
            value={isSIRAPSwitchedOn}
            onValueChange={val => {
              setIsSIRAPSwitchedOn(val);
              form.trigger();
            }}
          />
        </View>
        <View>
          <TextInput
            value={ipAddress}
            onChangeText={setIpAddress}
            label={t('IP-adress')}
            keyboardType="numeric"
            error={ipAddressFieldState.invalid}
            style={{backgroundColor: 'rgb(255, 251, 255)'}}
          />
          <HelperText type="error" visible={ipAddressFieldState.invalid}>
            {ipAddressFieldState.error?.message}
          </HelperText>
        </View>
        <View>
          <TextInput
            value={ipPort?.toString()}
            onChangeText={setIpPort}
            label={t('IP-port')}
            keyboardType="numeric"
            error={ipPortFieldState.invalid}
            style={{backgroundColor: 'rgb(255, 251, 255)'}}
          />
          <HelperText type="error" visible={ipPortFieldState.invalid}>
            {ipPortFieldState.error?.message}
          </HelperText>
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
  switchContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 18,
    paddingTop: 14,
    paddingRight: 10,
    paddingBottom: 1,
  },
  switch: {
    marginLeft: 10,
  },
});
