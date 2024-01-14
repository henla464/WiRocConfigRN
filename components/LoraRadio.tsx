import React, {useEffect, useImperativeHandle, useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {Icon, List, RadioButton, SegmentedButtons} from 'react-native-paper';
import IConfigComponentProps from '../interface/IConfigComponentProps';
import {SelectList} from 'react-native-dropdown-select-list';
import OnOffChip from './OnOffChip';
import {useBLEApiContext} from '../context/BLEApiContext';
import IRefRetType from '../interface/IRefRetType';

const LoraRadio = React.forwardRef<IRefRetType, IConfigComponentProps>(
  (compProps: IConfigComponentProps, ref: React.ForwardedRef<IRefRetType>) => {
    const [isLoraRadioEnabled, setIsLoraRadioEnabled] = useState<boolean>(true);
    const [loraMode, setLoraMode] = useState<string>('RECEIVER');
    const [channel, setChannel] = useState<string>('1');
    const [radioRange, setRadioRange] = useState<string>('L');
    const [codeRate, setCodeRate] = useState<string>('0');
    const [loraPower, setLoraPower] = useState<string>('22');

    const [origIsLoraRadioEnabled, setOrigIsLoraRadioEnabled] = useState<
      boolean | null
    >(null);
    const [origLoraMode, setOrigLoraMode] = useState<string | null>(null);
    const [origChannel, setOrigChannel] = useState<string | null>(null);
    const [origRadioRange, setOrigRadioRange] = useState<string | null>(null);
    const [origCodeRate, setOrigCodeRate] = useState<string | null>(null);
    const [origLoraPower, setOrigLoraPower] = useState<string | null>(null);

    const [triggerVersion, setTriggerVersion] = useState<number>(0);

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

    useImperativeHandle(ref, () => {
      return {
        save: () => {
          save();
        },
        reload: () => {
          reload();
        },
      };
    });

    const BLEAPI = useBLEApiContext();

    const reload = () => {
      setTriggerVersion(currentValue => {
        return currentValue + 1;
      });
    };

    const save = () => {
      if (origIsLoraRadioEnabled !== isLoraRadioEnabled) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'LoraRadio',
            'lora/enabled',
            isLoraRadioEnabled ? '1' : '0',
            updateFromWiRoc,
          );
        } else {
          console.log('LoraRadio:save:0 not connected to device');
        }
      }

      if (origLoraMode !== loraMode) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'LoraRadio',
            'loramode',
            loraMode,
            updateFromWiRoc,
          );
        } else {
          console.log('LoraRadio:save:1 not connected to device');
        }
      }
      if (origChannel !== channel) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'LoraRadio',
            'channel',
            channel,
            updateFromWiRoc,
          );
        } else {
          console.log('LoraRadio:save:2 not connected to device');
        }
      }
      if (origRadioRange !== radioRange) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'LoraRadio',
            'lorarange',
            radioRange,
            updateFromWiRoc,
          );
        } else {
          console.log('LoraRadio:save:3 not connected to device');
        }
      }
      if (origLoraPower !== loraPower) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'LoraRadio',
            'power',
            loraPower,
            updateFromWiRoc,
          );
        } else {
          console.log('LoraRadio:save:4 not connected to device');
        }
      }
      if (origCodeRate !== codeRate) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'LoraRadio',
            'coderate',
            codeRate,
            updateFromWiRoc,
          );
        } else {
          console.log('LoraRadio:save:5 not connected to device');
        }
      }
    };

    const updateFromWiRoc = (propName: string, propValue: string) => {
      console.log('LoraRadio:updateFromWiRoc: propName: ' + propName);
      console.log('LoraRadio:updateFromWiRoc: propValue: ' + propValue);
      switch (propName) {
        case 'lora/enabled':
          setIsLoraRadioEnabled(parseInt(propValue, 10) !== 0);
          setOrigIsLoraRadioEnabled(parseInt(propValue, 10) !== 0);
          break;
        case 'loramode':
          setLoraMode(propValue);
          setOrigLoraMode(propValue);
          break;
        case 'channel':
          setChannel(propValue);
          setOrigChannel(propValue);
          break;
        case 'lorarange':
          setRadioRange(propValue);
          setOrigRadioRange(propValue);
          break;
        case 'power':
          setLoraPower(propValue);
          setOrigLoraPower(propValue);
          break;
        case 'coderate':
          setCodeRate(propValue);
          setOrigCodeRate(propValue);
          break;
      }
    };
    useEffect(() => {
      console.log('LoraRadio: load values');
      async function getLoraRadioSettings() {
        console.log('getLoraRadioSettings');
        if (BLEAPI.connectedDevice !== null) {
          console.log('getLoraRadioSettings:connectedDevice !== null');
          let pc = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'LoraRadio',
            'loramode|channel|lorarange|power|coderate|lora/enabled',
            updateFromWiRoc,
          );
        }
      }
      getLoraRadioSettings();
    }, [BLEAPI, triggerVersion]);

    useEffect(() => {
      if (
        origIsLoraRadioEnabled === null ||
        origLoraMode === null ||
        origChannel === null ||
        origRadioRange === null ||
        origCodeRate === null ||
        origLoraPower === null
      ) {
        return;
      }
      if (
        origIsLoraRadioEnabled !== isLoraRadioEnabled ||
        origLoraMode !== loraMode ||
        origChannel !== channel ||
        origRadioRange !== radioRange ||
        origCodeRate !== codeRate ||
        origLoraPower !== loraPower
      ) {
        compProps.setIsDirtyFunction(compProps.id, true);
      } else {
        compProps.setIsDirtyFunction(compProps.id, false);
      }
    }, [
      isLoraRadioEnabled,
      loraMode,
      channel,
      radioRange,
      codeRate,
      loraPower,
      compProps,
      origIsLoraRadioEnabled,
      origLoraMode,
      origChannel,
      origRadioRange,
      origCodeRate,
      origLoraPower,
    ]);

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
            disabledItemStyles={{backgroundColor: 'gray'}}
            disabledTextStyles={{fontSize: 30}}
            dropdownTextStyles={{fontSize: 30}}
            dropdownStyles={{backgroundColor: 'gray'}}
            inputStyles={{
              fontSize: 60,
              fontWeight: '900',
              color: isLoraRadioEnabled
                ? 'rgb(100,100,100)'
                : 'rgb(155,155,155)',
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
            onValueChange={value => setRadioRange(value)}
            value={radioRange}>
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
              label="Medium Long 781 bps"
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
            Code Rate
          </Text>
          <SelectList
            setSelected={(val: string) => {
              console.log(val);
              setCodeRate(val);
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
              color: isLoraRadioEnabled
                ? 'rgb(100,100,100)'
                : 'rgb(155,155,155)',
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
              return item.key === codeRate;
            })}
          />

          <Text style={{fontSize: 30, fontWeight: 'bold', paddingTop: 14}}>
            Uteffekt
          </Text>

          <SelectList
            setSelected={(val: string) => {
              console.log(val);
              setLoraPower(val);
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
              color: isLoraRadioEnabled
                ? 'rgb(100,100,100)'
                : 'rgb(155,155,155)',
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
              return item.key === loraPower;
            })}
          />
        </View>
      </List.Accordion>
    );
  },
);

export default LoraRadio;

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
});
