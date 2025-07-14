import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Divider, Icon, List, Switch, Text} from 'react-native-paper';

import {LoraMode, LoraRange} from '@api/index';
import {ListItemMenu, ListItemMenuItem} from '@lib/components/ListItemMenu';
import {useConfigurationProperty} from '@lib/hooks/useConfigurationProperty';

import {SectionComponentProps} from '../';
import OnOffChip from './OnOffChip';

export default function LoraRadio({
  deviceId,
  onDefaultValuesChange,
}: SectionComponentProps) {
  const [expanded, setExpanded] = React.useState(false);
  const handlePress = () => setExpanded(!expanded);

  const [
    {
      field: {value: isLoraRadioEnabled, onChange: setLoraRadioEnabled},
    },
  ] = useConfigurationProperty(deviceId, 'lora/enabled', onDefaultValuesChange);

  const [
    {
      field: {value: channel, onChange: setChannel},
    },
  ] = useConfigurationProperty(deviceId, 'channel', onDefaultValuesChange);

  const [
    {
      field: {value: loraMode, onChange: setLoraMode},
    },
  ] = useConfigurationProperty(deviceId, 'loramode', onDefaultValuesChange);

  const [
    {
      field: {value: loraRange, onChange: setLoraRange},
    },
  ] = useConfigurationProperty(deviceId, 'lorarange', onDefaultValuesChange);

  const [
    {
      field: {value: loraPower, onChange: setLoraPower},
    },
  ] = useConfigurationProperty(deviceId, 'power', onDefaultValuesChange);

  const [
    {
      field: {value: codeRate, onChange: setCodeRate},
    },
  ] = useConfigurationProperty(deviceId, 'coderate', onDefaultValuesChange);

  const [
    {
      field: {
        value: acknowledgementRequested,
        onChange: setAcknowledgementRequested,
      },
    },
  ] = useConfigurationProperty(
    deviceId,
    'acknowledgementrequested',
    onDefaultValuesChange,
  );

  const [
    {
      field: {value: isHamEnabled},
    },
  ] = useConfigurationProperty(deviceId, 'ham/enabled', onDefaultValuesChange);

  const modeOptions = [
    {value: 'RECEIVER', label: 'Mottagare', icon: 'login'},
    {value: 'SENDER', label: 'Sändare', icon: 'logout'},
    {value: 'REPEATER', label: 'Repeterare', icon: 'pan-horizontal'},
  ];
  const selectedModeOption = modeOptions.find(m => m.value === loraMode);

  const channelOptions = [
    {value: '1', label: '1'},
    {value: '2', label: '2'},
    {value: '3', label: '3'},
    {value: '4', label: '4'},
    {value: '5', label: '5'},
    {value: '6', label: '6'},
    {value: 'HAM1', label: 'HAM1', disabled: !isHamEnabled},
    {value: 'HAM2', label: 'HAM2', disabled: !isHamEnabled},
    {value: 'HAM3', label: 'HAM3', disabled: !isHamEnabled},
    {value: 'HAM4', label: 'HAM4', disabled: !isHamEnabled},
    {value: 'HAM5', label: 'HAM5', disabled: !isHamEnabled},
  ];
  const selectedChannelOption = channelOptions.find(c => c.value === channel);

  const codeRateOptions = [
    {value: 0, label: '4/5 (1 ECC bit, 4 data bits)'},
    {value: 1, label: '4/6 (2 ECC bits, 4 data bits)'},
    {value: 2, label: '4/7 (3 ECC bits, 4 data bits)'},
    {value: 3, label: '4/8 (4 ECC bits, 4 data bits)'},
  ];
  const selectedCodeRateOption = codeRateOptions.find(
    c => c.value === codeRate,
  );

  const rangeOptions = [
    {label: 'Ultra Long 73 bps', value: 'UL'},
    {label: 'eXtra Long 134 bps', value: 'XL'},
    {label: 'Long 244 bps', value: 'L'},
    {label: 'Medium Long 439 bps', value: 'ML'},
    {label: 'Medium short 781 bps', value: 'MS'},
    {label: 'Short 1367 bps', value: 'S'},
  ];
  const selectedRangeOption = rangeOptions.find(r => r.value === loraRange);

  const powerOptions = [
    {value: 1, label: '1 dBm'},
    {value: 2, label: '2 dBm'},
    {value: 3, label: '3 dbm'},
    {value: 4, label: '4 dbm'},
    {value: 5, label: '5 dbm'},
    {value: 6, label: '6 dbm'},
    {value: 7, label: '7 dbm'},
    {value: 8, label: '8 dbm'},
    {value: 9, label: '9 dbm'},
    {value: 10, label: '10 dbm'},
    {value: 11, label: '11 dbm'},
    {value: 12, label: '12 dbm'},
    {value: 13, label: '13 dbm'},
    {value: 14, label: '14 dbm'},
    {value: 15, label: '15 dbm'},
    {value: 16, label: '16 dbm (max 11 element yagi)'},
    {value: 17, label: '17 dbm'},
    {value: 18, label: '18 dbm'},
    {value: 19, label: '19 dbm (max 7 element yagi)'},
    {value: 20, label: '20 dbm'},
    {value: 21, label: '21 dbm'},
    {value: 22, label: '22 dbm (max 4 element yagi)'},
  ];
  const selectedPowerOption = powerOptions.find(p => p.value === loraPower);

  return (
    <List.Accordion
      id="lora"
      title="Lora-radio"
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
          <Text>
            {selectedModeOption &&
            selectedChannelOption &&
            selectedRangeOption ? (
              <>
                {selectedModeOption.label} ∙ {selectedChannelOption.label} ∙{' '}
                {selectedRangeOption.value}
              </>
            ) : null}
          </Text>
          {typeof isLoraRadioEnabled === 'boolean' && (
            <OnOffChip on={isLoraRadioEnabled} />
          )}
          {isExpanded ? (
            <Icon source="chevron-up" size={25} />
          ) : (
            <Icon source="chevron-down" size={25} />
          )}
        </View>
      )}>
      <Divider bold={true} />
      <View style={styles.container}>
        <View style={styles.containerColumn}>
          <List.Item
            title="Lora-radio"
            description={isLoraRadioEnabled ? 'På' : 'Av'}
            disabled={typeof isLoraRadioEnabled !== 'boolean'}
            style={{
              opacity:
                typeof isLoraRadioEnabled === 'boolean' ? undefined : 0.5,
            }}
            left={props => <List.Icon {...props} icon="power" />}
            right={props => (
              <Switch
                {...props}
                value={isLoraRadioEnabled}
                onValueChange={setLoraRadioEnabled}
              />
            )}
          />
          <ListItemMenu
            disabled={!isLoraRadioEnabled}
            title="Radiofunktion"
            description={selectedModeOption?.label}
            icon={selectedModeOption?.icon}>
            {modeOptions.map(item => (
              <ListItemMenuItem
                key={item.value}
                title={item.label}
                leadingIcon={item.icon}
                onPress={() => {
                  setLoraMode(item.value as LoraMode);
                }}
              />
            ))}
          </ListItemMenu>
          <ListItemMenu
            disabled={!isLoraRadioEnabled}
            icon="sine-wave"
            title="Kanal"
            description={selectedChannelOption?.label}>
            {channelOptions.map(item => (
              <ListItemMenuItem
                key={item.value}
                title={item.label}
                onPress={() => {
                  setChannel(item.value);
                }}
                disabled={item.disabled}
              />
            ))}
          </ListItemMenu>
          <ListItemMenu
            disabled={!isLoraRadioEnabled}
            icon="signal-distance-variant"
            title="Räckvidd / Datahastighet"
            description={
              rangeOptions.find(r => r.value === loraRange)?.label ?? '?'
            }>
            {rangeOptions.map(item => (
              <ListItemMenuItem
                key={item.value}
                title={item.label}
                onPress={() => {
                  setLoraRange(item.value as LoraRange);
                }}
              />
            ))}
          </ListItemMenu>
          <List.Item
            left={props => <List.Icon {...props} icon="reply" />}
            disabled={!isLoraRadioEnabled}
            style={{
              opacity: isLoraRadioEnabled ? undefined : 0.5,
            }}
            title="Begär bekräftelse"
            description={
              acknowledgementRequested
                ? 'Mottagaren ska bekräfta mottagen stämpling'
                : 'Mottagaren bekräftar inte mottagen stämpling'
            }
            right={props => (
              <Switch
                {...props}
                value={acknowledgementRequested}
                onValueChange={value => {
                  setAcknowledgementRequested(value);
                }}
                disabled={!isLoraRadioEnabled}
              />
            )}
          />
          <ListItemMenu
            disabled={!isLoraRadioEnabled}
            icon="code-json"
            title="Code Rate"
            description={selectedCodeRateOption?.label}>
            {codeRateOptions.map(item => (
              <ListItemMenuItem
                key={item.value}
                title={item.label}
                onPress={() => {
                  setCodeRate(item.value);
                }}
              />
            ))}
          </ListItemMenu>
          <ListItemMenu
            disabled={!isLoraRadioEnabled}
            icon="transmission-tower-export"
            title="Uteffekt"
            description={selectedPowerOption?.label}>
            {powerOptions.map(item => (
              <ListItemMenuItem
                key={item.value}
                title={item.label}
                onPress={() => {
                  setLoraPower(item.value);
                }}
              />
            ))}
          </ListItemMenu>
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
  containerColumn: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 10,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
});
