import React, {useEffect, useImperativeHandle, useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {Icon, List, TextInput} from 'react-native-paper';
import IConfigComponentProps from '../interface/IConfigComponentProps';
import MaskInput from 'react-native-mask-input';
import {RenderProps} from 'react-native-paper/lib/typescript/components/TextInput/types';
import OnOffChip from './OnOffChip';
import IRefRetType from '../interface/IRefRetType';
import {useBLEApiContext} from '../context/BLEApiContext';

const SIRAP = React.forwardRef<IRefRetType, IConfigComponentProps>(
  (compProps: IConfigComponentProps, ref: React.ForwardedRef<IRefRetType>) => {
    const [isSIRAPSwitchedOn, setIsSIRAPSwitchedOn] = useState<boolean>(false);
    const [ipAddress, setIpAddress] = useState<string>('');
    const [ipPort, setIpPort] = useState<string>('10000');

    const [origIsSIRAPSwitchedOn, setOrigIsSIRAPSwitchedOn] = useState<
      boolean | null
    >(null);
    const [origIpAddress, setOrigIpAddress] = useState<string | null>(null);
    const [origIpPort, setOrigIpPort] = useState<string | null>(null);

    const [triggerVersion, setTriggerVersion] = useState<number>(0);

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
      if (origIsSIRAPSwitchedOn !== isSIRAPSwitchedOn) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'SIRAP',
            'onewayreceive',
            isSIRAPSwitchedOn ? '1' : '0',
            (propName: string, propValue: string) => {
              console.log(
                'SIRAP propName: ' +
                  propName +
                  ' propValue: ' +
                  propValue +
                  ' Implement error handling!',
              );
            },
          );
        } else {
          console.log('SIRAP:save:1 not connected to device');
        }
      }

      if (origIpAddress !== ipAddress) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'SIRAP',
            'force4800baudrate',
            ipAddress,
            (propName: string, propValue: string) => {
              console.log(
                'SIRAP propName: ' +
                  propName +
                  ' propValue: ' +
                  propValue +
                  ' Implement error handling!',
              );
            },
          );
        } else {
          console.log('SIRAP:save:2 not connected to device');
        }
      }

      if (origIpPort !== ipPort) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'SIRAP',
            'force4800baudrate',
            ipPort,
            (propName: string, propValue: string) => {
              console.log(
                'SIRAP propName: ' +
                  propName +
                  ' propValue: ' +
                  propValue +
                  ' Implement error handling!',
              );
            },
          );
        } else {
          console.log('SIRAP:save:3 not connected to device');
        }
      }
    };

    const updateFromWiRoc = (propName: string, propValue: string) => {
      console.log('SIRAP:updateFromWiRoc: propName: ' + propName);
      console.log('SIRAP:updateFromWiRoc: propValue: ' + propValue);
      switch (propName) {
        case 'sendtosirapenabled':
          setIsSIRAPSwitchedOn(parseInt(propValue, 10) !== 0);
          setOrigIsSIRAPSwitchedOn(parseInt(propValue, 10) !== 0);
          break;
        case 'sendtosirapip':
          setIpAddress(propValue);
          setOrigIpAddress(propValue);
          break;
        case 'sendtosirapipport':
          setIpPort(propValue);
          setOrigIpPort(propValue);
          break;
      }
    };

    useEffect(() => {
      async function getSIRAPSettings() {
        if (BLEAPI.connectedDevice !== null) {
          let pc = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'SIRAP',
            'sendtosirapenabled',
            updateFromWiRoc,
          );
          let pc2 = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'SIRAP',
            'sendtosirapip',
            updateFromWiRoc,
          );
          let pc3 = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'SIRAP',
            'sendtosirapipport',
            updateFromWiRoc,
          );
        }
      }
      getSIRAPSettings();
    }, [BLEAPI, triggerVersion]);

    useEffect(() => {
      if (
        origIsSIRAPSwitchedOn == null ||
        origIpAddress === null ||
        origIpPort === null
      ) {
        return;
      }
      if (
        origIsSIRAPSwitchedOn !== isSIRAPSwitchedOn ||
        origIpAddress !== ipAddress ||
        origIpPort !== ipPort
      ) {
        compProps.setIsDirtyFunction(compProps.id, true);
      } else {
        compProps.setIsDirtyFunction(compProps.id, false);
      }
    }, [
      isSIRAPSwitchedOn,
      ipAddress,
      ipPort,
      compProps,
      origIsSIRAPSwitchedOn,
      origIpAddress,
      origIpPort,
    ]);

    let groupMaskForDiffLengthForNext = [
      [/[1-9]/],
      [/[1-9]/, /[\d.]/],
      [/[1-9]/, /\d/, /[\d.]/],
      [/[1-2]/, /\d/, /\d/, '.'],
    ];
    let groupMaskForDiffLengthForNext_LastGroup = [
      [/[1-9]/],
      [/[1-9]/, /\d/],
      [/[1-2]/, /\d/, /\d/],
      [/[1-2]/, /\d/, /\d/],
    ];
    function getMaskForGroup(
      currentCharsInGroup: string,
      lastGroup: boolean,
    ): (RegExp | string)[] {
      let noOfCharsInGroup = Math.min(currentCharsInGroup.length, 3);
      if (!lastGroup) {
        if (noOfCharsInGroup === 1) {
          return groupMaskForDiffLengthForNext[noOfCharsInGroup];
        } else if (noOfCharsInGroup === 2) {
          // 2 characters
          if (currentCharsInGroup[0] > '2') {
            return [/\d/, /\d/, '.'];
          } else if (
            currentCharsInGroup[0] >= '2' &&
            currentCharsInGroup[1] >= '6'
          ) {
            return [/[2]/, /\d/, '.'];
          } else if (
            currentCharsInGroup[0] === '2' &&
            currentCharsInGroup[1] === '5'
          ) {
            return [/[2]/, /[5]/, /[0-5.]/];
          } else {
            return [/\d/, /\d/, /[\d.]/];
          }
        } else if (noOfCharsInGroup === 3) {
          if (currentCharsInGroup[0] > '2') {
            return [/\d/, /\d/, '.'];
          } else if (
            currentCharsInGroup[0] >= '2' &&
            currentCharsInGroup[1] >= '6'
          ) {
            return [/\d/, /\d/, /\d/, '.'];
          } else if (
            currentCharsInGroup[0] === '2' &&
            currentCharsInGroup[1] === '5'
          ) {
            return [/[2]/, /[5]/, /[0-5]/, '.'];
          } else {
            return groupMaskForDiffLengthForNext[noOfCharsInGroup];
          }
        } else {
          return groupMaskForDiffLengthForNext[noOfCharsInGroup];
        }
      } else {
        if (noOfCharsInGroup === 1) {
          return groupMaskForDiffLengthForNext_LastGroup[noOfCharsInGroup];
        } else if (noOfCharsInGroup === 2) {
          // 2 characters
          if (currentCharsInGroup[0] > '2') {
            return [/\d/, /\d/];
          } else if (
            currentCharsInGroup[0] >= '2' &&
            currentCharsInGroup[1] >= '6'
          ) {
            return [/[2]/, /\d/];
          } else if (
            currentCharsInGroup[0] === '2' &&
            currentCharsInGroup[1] === '5'
          ) {
            return [/[2]/, /[5]/, /[0-5]/];
          } else {
            return [/\d/, /\d/, /[\d]/];
          }
        } else if (noOfCharsInGroup === 3) {
          if (currentCharsInGroup[0] > '2') {
            return [/\d/, /\d/];
          } else if (
            currentCharsInGroup[0] >= '2' &&
            currentCharsInGroup[1] >= '6'
          ) {
            return [/\d/, /\d/];
          } else if (
            currentCharsInGroup[0] === '2' &&
            currentCharsInGroup[1] === '5'
          ) {
            return [/[2]/, /[5]/, /[0-5]/];
          } else {
            return groupMaskForDiffLengthForNext_LastGroup[noOfCharsInGroup];
          }
        } else {
          return groupMaskForDiffLengthForNext_LastGroup[noOfCharsInGroup];
        }
      }
    }

    // string pattern = @"\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b";
    return (
      <List.Accordion
        title="SIRAP-tcp/ip"
        id={compProps.id}
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
        <View style={styles.container}>
          <View style={styles.switchContainer}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                alignItems: 'center',
                paddingBottom: 8,
              }}>
              Aktivera:{' '}
            </Text>
            <Switch
              value={isSIRAPSwitchedOn}
              onValueChange={val => setIsSIRAPSwitchedOn(val)}
            />
          </View>
        </View>
        <View>
          <TextInput
            value=" "
            label="IP Adress"
            keyboardType="numeric"
            render={(props: RenderProps) => (
              <MaskInput
                {...props}
                value={ipAddress}
                maskAutoComplete={true}
                onChangeText={(masked, unmasked) => {
                  // let noOfDots = masked.split('.').length - 1;
                  // let lastIndexOfDot = masked.lastIndexOf('.');
                  // if (
                  //   lastIndexOfDot === masked.length - 4 &&
                  //   ipAddress.length < masked.length &&
                  //   noOfDots < 3
                  // ) {
                  //   masked = masked + '.';
                  // }
                  setIpAddress(masked);
                }}
                mask={text => {
                  let ipAddressParts =
                    text === undefined ? [''] : text.split('.');
                  if (ipAddressParts.length === 1) {
                    let mask1 = getMaskForGroup(ipAddressParts[0], false);
                    return [...mask1];
                  } else if (ipAddressParts.length === 2) {
                    let mask1 = getMaskForGroup(ipAddressParts[0], false);
                    let mask2 = getMaskForGroup(ipAddressParts[1], false);
                    return [...mask1, ...mask2];
                  } else if (ipAddressParts.length === 3) {
                    let mask1 = getMaskForGroup(ipAddressParts[0], false);
                    let mask2 = getMaskForGroup(ipAddressParts[1], false);
                    let mask3 = getMaskForGroup(ipAddressParts[2], false);
                    return [...mask1, ...mask2, ...mask3];
                  } else {
                    let mask1 = getMaskForGroup(ipAddressParts[0], false);
                    let mask2 = getMaskForGroup(ipAddressParts[1], false);
                    let mask3 = getMaskForGroup(ipAddressParts[2], false);
                    let mask4 = getMaskForGroup(ipAddressParts[3], true);
                    return [...mask1, ...mask2, ...mask3, ...mask4];
                  }
                }}
              />
            )}
          />
          <TextInput
            value={ipPort}
            label="IP Port"
            keyboardType="numeric"
            render={(props: RenderProps) => (
              <MaskInput
                {...props}
                value={ipPort}
                onChangeText={(masked, unmasked) => {
                  setIpPort(masked);
                }}
                mask={[/\d/, /\d/, /\d/, /\d/, /\d/]}
              />
            )}
          />
        </View>
      </List.Accordion>
    );
  },
);

export default SIRAP;

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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switch: {
    marginLeft: 10,
  },
});
