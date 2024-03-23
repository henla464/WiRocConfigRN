import React from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {
  Checkbox,
  Icon,
  List,
  RadioButton,
  SegmentedButtons,
} from 'react-native-paper';
import OnOffChip from './OnOffChip';
import {LoraMode, LoraRange} from '../api';
import {SectionComponentProps} from './ConfigurationScreen';
import {SelectList} from 'react-native-dropdown-select-list';
import {useConfigurationProperty} from '../hooks/useConfigurationProperty';

export default function LoraRadio({
  deviceId,
  onDefaultValuesChange,
}: SectionComponentProps) {
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

  const channelList = [
    {key: '1', value: '1', disabled: !isLoraRadioEnabled},
    {key: '2', value: '2', disabled: !isLoraRadioEnabled},
    {key: '3', value: '3', disabled: !isLoraRadioEnabled},
    {key: '4', value: '4', disabled: !isLoraRadioEnabled},
    {key: '5', value: '5', disabled: !isLoraRadioEnabled},
    {key: '6', value: '6', disabled: !isLoraRadioEnabled},
    {key: '7', value: '7', disabled: !isLoraRadioEnabled},
  ];

  const codeRateList = [
    {
      key: '0',
      value: '4/5 (1 ECC bit, 4 data bits)',
      disabled: !isLoraRadioEnabled,
    },
    {
      key: '1',
      value: '4/6 (2 ECC bits, 4 data bits)',
      disabled: !isLoraRadioEnabled,
    },
    {
      key: '2',
      value: '4/7 (3 ECC bits, 4 data bits)',
      disabled: !isLoraRadioEnabled,
    },
    {
      key: '3',
      value: '4/8 (4 ECC bits, 4 data bits)',
      disabled: !isLoraRadioEnabled,
    },
  ];

  const loraPowerList = [
    {key: '1', value: '1 dBm', disabled: !isLoraRadioEnabled},
    {key: '2', value: '2 dBm', disabled: !isLoraRadioEnabled},
    {key: '3', value: '3 dbm', disabled: !isLoraRadioEnabled},
    {key: '4', value: '4 dbm', disabled: !isLoraRadioEnabled},
    {key: '5', value: '5 dbm', disabled: !isLoraRadioEnabled},
    {key: '6', value: '6 dbm', disabled: !isLoraRadioEnabled},
    {key: '7', value: '7 dbm', disabled: !isLoraRadioEnabled},
    {key: '8', value: '8 dbm', disabled: !isLoraRadioEnabled},
    {key: '9', value: '9 dbm', disabled: !isLoraRadioEnabled},
    {key: '10', value: '10 dbm', disabled: !isLoraRadioEnabled},
    {key: '11', value: '11 dbm', disabled: !isLoraRadioEnabled},
    {key: '12', value: '12 dbm', disabled: !isLoraRadioEnabled},
    {key: '13', value: '13 dbm', disabled: !isLoraRadioEnabled},
    {key: '14', value: '14 dbm', disabled: !isLoraRadioEnabled},
    {key: '15', value: '15 dbm', disabled: !isLoraRadioEnabled},
    {
      key: '16',
      value: '16 dbm (max 11 element yagi)',
      disabled: !isLoraRadioEnabled,
    },
    {key: '17', value: '17 dbm', disabled: !isLoraRadioEnabled},
    {key: '18', value: '18 dbm', disabled: !isLoraRadioEnabled},
    {
      key: '19',
      value: '19 dbm (max 7 element yagi)',
      disabled: !isLoraRadioEnabled,
    },
    {key: '20', value: '20 dbm', disabled: !isLoraRadioEnabled},
    {key: '21', value: '21 dbm', disabled: !isLoraRadioEnabled},
    {
      key: '22',
      value: '22 dbm (max 4 element yagi)',
      disabled: !isLoraRadioEnabled,
    },
  ];

  return (
    <List.Accordion
      id="lora"
      title="Lora Radio"
      right={({isExpanded}) => (
        <View style={styles.accordionHeader}>
          <Text>
            {loraMode
              ? {
                  RECEIVER: 'Mottagare',
                  SENDER: 'Sändare',
                  REPEATER: 'Repeater',
                }[loraMode]
              : ''}
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
            disabled={typeof isLoraRadioEnabled !== 'boolean'}
            value={isLoraRadioEnabled}
            onValueChange={val => {
              setLoraRadioEnabled(val);
            }}
          />
        </View>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            alignItems: 'center',
            paddingBottom: 8,
          }}>
          Radio funktion
        </Text>
        {loraMode && (
          <SegmentedButtons
            value={loraMode}
            onValueChange={value => {
              setLoraMode(value as LoraMode);
            }}
            buttons={[
              {
                icon: 'login',
                value: 'RECEIVER',
                label: 'Mottagare',
                disabled: !isLoraRadioEnabled,
              },
              {
                icon: 'pan-horizontal',
                value: 'REPEATER',
                label: 'Repeater',
                disabled: !isLoraRadioEnabled,
              },
              {
                icon: 'logout',
                value: 'SENDER',
                label: 'Sändare',
                disabled: !isLoraRadioEnabled,
              },
            ]}
          />
        )}

        <Text style={{fontSize: 40, fontWeight: 'bold', paddingTop: 10}}>
          Kanal
        </Text>
        <SelectList
          setSelected={(val: string) => {
            setChannel(parseInt(val, 10));
          }}
          data={channelList}
          save="key"
          search={false}
          placeholder={' '}
          disabledItemStyles={{backgroundColor: 'gray'}}
          disabledTextStyles={{fontSize: 30}}
          dropdownTextStyles={{fontSize: 30}}
          dropdownStyles={{backgroundColor: 'gray'}}
          inputStyles={{
            fontSize: 60,
            fontWeight: '900',
            color: isLoraRadioEnabled ? 'rgb(100,100,100)' : 'rgb(155,155,155)',
          }}
          boxStyles={{
            width: 120,
            alignItems: 'center',
          }}
          arrowicon={
            <Icon
              source="chevron-down"
              size={35}
              color={
                isLoraRadioEnabled ? 'rgb(100,100,100)' : 'rgb(155,155,155)'
              }
            />
          }
          defaultOption={{key: channel, value: channel}}
        />

        <Text style={{fontSize: 30, fontWeight: 'bold', paddingTop: 14}}>
          Räckvidd - datahastighet
        </Text>
        <RadioButton.Group
          onValueChange={value => {
            setLoraRange(value as LoraRange);
          }}
          value={loraRange ?? ''}>
          <RadioButton.Item
            label="Ultra Long 73 bps"
            value="UL"
            labelVariant="titleLarge"
            disabled={!isLoraRadioEnabled}
            style={{
              flexDirection: 'row-reverse',
              paddingBottom: 3,
              paddingTop: 3,
            }}
          />
          <RadioButton.Item
            label="eXtra Long 134 bps"
            value="XL"
            labelVariant="titleLarge"
            disabled={!isLoraRadioEnabled}
            style={{
              flexDirection: 'row-reverse',
              paddingBottom: 3,
              paddingTop: 3,
            }}
          />
          <RadioButton.Item
            label="Long 244 bps"
            value="L"
            labelVariant="titleLarge"
            disabled={!isLoraRadioEnabled}
            style={{
              flexDirection: 'row-reverse',
              paddingBottom: 3,
              paddingTop: 3,
            }}
          />
          <RadioButton.Item
            label="Medium Long 439 bps"
            value="ML"
            labelVariant="titleLarge"
            disabled={!isLoraRadioEnabled}
            style={{
              flexDirection: 'row-reverse',
              paddingBottom: 3,
              paddingTop: 3,
            }}
          />
          <RadioButton.Item
            label="Medium short 781 bps"
            value="MS"
            labelVariant="titleLarge"
            disabled={!isLoraRadioEnabled}
            style={{
              flexDirection: 'row-reverse',
              paddingBottom: 3,
              paddingTop: 3,
            }}
          />
          <RadioButton.Item
            label="Short 1367 bps"
            value="S"
            labelVariant="titleLarge"
            disabled={!isLoraRadioEnabled}
            style={{
              flexDirection: 'row-reverse',
              paddingBottom: 3,
              paddingTop: 3,
            }}
          />
        </RadioButton.Group>
        <Text style={{fontSize: 30, fontWeight: 'bold', paddingTop: 14}}>
          Begär bekräftelse
        </Text>
        <View style={styles.mainCheckBoxContainer}>
          <Checkbox.Item
            label="Begär att mottagaren bekräftar mottagen stämpling"
            position="leading"
            status={acknowledgementRequested ? 'checked' : 'unchecked'}
            onPress={() => {
              setAcknowledgementRequested(!acknowledgementRequested);
            }}
            disabled={!isLoraRadioEnabled}
            labelStyle={styles.checkBoxLabel}
          />
        </View>
        <Text style={{fontSize: 30, fontWeight: 'bold', paddingTop: 14}}>
          Code Rate
        </Text>
        <SelectList
          setSelected={(val: string) => {
            setCodeRate(parseInt(val, 10));
          }}
          data={codeRateList}
          save="key"
          search={false}
          placeholder={' '}
          disabledItemStyles={{backgroundColor: 'gray'}}
          disabledTextStyles={{fontSize: 20}}
          dropdownTextStyles={{fontSize: 20}}
          dropdownStyles={{backgroundColor: 'gray'}}
          inputStyles={{
            fontSize: 20,
            fontWeight: '900',
            color: isLoraRadioEnabled ? 'rgb(100,100,100)' : 'rgb(155,155,155)',
          }}
          boxStyles={{
            alignItems: 'center',
          }}
          arrowicon={
            <Icon
              source="chevron-down"
              size={35}
              color={
                isLoraRadioEnabled ? 'rgb(100,100,100)' : 'rgb(155,155,155)'
              }
            />
          }
          defaultOption={codeRateList.find(item => {
            return parseInt(item.key, 10) === codeRate;
          })}
        />

        <Text style={{fontSize: 30, fontWeight: 'bold', paddingTop: 14}}>
          Uteffekt
        </Text>

        <SelectList
          setSelected={(val: string) => {
            setLoraPower(parseInt(val, 10));
          }}
          data={loraPowerList}
          save="key"
          search={false}
          placeholder={' '}
          dropdownShown={isLoraRadioEnabled ? undefined : false}
          disabledItemStyles={{backgroundColor: 'gray'}}
          disabledTextStyles={{fontSize: 20}}
          dropdownTextStyles={{fontSize: 20}}
          dropdownStyles={{backgroundColor: 'gray'}}
          inputStyles={{
            fontSize: 20,
            fontWeight: '900',
            color: isLoraRadioEnabled ? 'rgb(100,100,100)' : 'rgb(155,155,155)',
          }}
          boxStyles={{
            alignItems: 'center',
          }}
          arrowicon={
            <Icon
              source="chevron-down"
              size={35}
              color={
                isLoraRadioEnabled ? 'rgb(100,100,100)' : 'rgb(155,155,155)'
              }
            />
          }
          defaultOption={loraPowerList.find(item => {
            return parseInt(item.key, 10) === loraPower;
          })}
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
    paddingBottom: 10,
    backgroundColor: 'lightgray',

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
  mainCheckBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    margin: 0,
  },
  checkBoxLabel: {
    marginLeft: 5,
  },
});
