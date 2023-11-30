import React, {useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {
  Chip,
  Icon,
  List,
  RadioButton,
  SegmentedButtons,
} from 'react-native-paper';
import IConfigComponentProps from '../interface/IConfigComponentProps';
import {SelectList} from 'react-native-dropdown-select-list';
import OnOffChip from './OnOffChip';

export default function LoraRadio(compProps: IConfigComponentProps) {
  const [isLoraRadioEnabled, setIsLoraRadioEnabled] = useState<boolean>(true);
  const [loraMode, setLoraMode] = useState<string>('RECEIVER');
  const [channel, setChannel] = useState<string>('1');
  const [radioRange, setRadioRange] = useState<string>('L');

  const channelList = [
    {key: '1', value: '1'},
    {key: '2', value: '2'},
    {key: '3', value: '3'},
    {key: '4', value: '4'},
    {key: '5', value: '5'},
    {key: '6', value: '6'},
    {key: '7', value: '7'},
  ];

  return (
    <List.Accordion
      title="Lora Radio"
      id={compProps.id}
      right={({isExpanded}) => (
        <View style={styles.accordionHeader}>
          <Text>
            {loraMode === 'RECEIVER'
              ? 'Mottagare'
              : loraMode === 'SENDER'
              ? 'Sändare'
              : 'Repeater'}
          </Text>
          <OnOffChip on={isLoraRadioEnabled} />
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
            value={isLoraRadioEnabled}
            onValueChange={val => setIsLoraRadioEnabled(val)}
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
        <SegmentedButtons
          value={loraMode}
          onValueChange={setLoraMode}
          buttons={[
            {
              icon: 'login',
              value: 'RECEIVER',
              label: 'Mottagare',
            },
            {
              icon: 'pan-horizontal',
              value: 'REPEATER',
              label: 'Repeater',
            },
            {icon: 'logout', value: 'SENDER', label: 'Sändare'},
          ]}
        />

        <Text style={{fontSize: 40, fontWeight: 'bold', paddingTop: 10}}>
          Kanal
        </Text>
        <SelectList
          setSelected={(val: string) => {
            console.log(val);
            setChannel(val);
          }}
          data={channelList}
          save="key"
          search={false}
          placeholder={' '}
          dropdownTextStyles={{fontSize: 30}}
          dropdownStyles={{backgroundColor: 'gray'}}
          inputStyles={{
            fontSize: 60,
            fontWeight: '900',
          }}
          boxStyles={{
            width: 120,
            alignItems: 'center',
          }}
          arrowicon={<Icon source="chevron-down" size={35} color={'black'} />}
          defaultOption={{key: '1', value: '1'}}
        />

        <Text style={{fontSize: 30, fontWeight: 'bold', paddingTop: 14}}>
          Räckvidd - datahastighet
        </Text>
        <RadioButton.Group
          onValueChange={value => setRadioRange(value)}
          value={radioRange}>
          <RadioButton.Item
            label="Ultra Long 73 bps"
            value="UL"
            labelVariant="titleLarge"
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
            style={{
              flexDirection: 'row-reverse',
              paddingBottom: 3,
              paddingTop: 3,
            }}
          />
          <RadioButton.Item
            label="Medium Long 781 bps"
            value="MS"
            labelVariant="titleLarge"
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
            style={{
              flexDirection: 'row-reverse',
              paddingBottom: 3,
              paddingTop: 3,
            }}
          />
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
    height: 600,
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
