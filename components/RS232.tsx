import React, {useEffect, useImperativeHandle, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Checkbox, Icon, List, RadioButton} from 'react-native-paper';
import IConfigComponentProps from '../interface/IConfigComponentProps';
import OnOffChip from './OnOffChip';
import IRefRetType from '../interface/IRefRetType';
import {useBLEApiContext} from '../context/BLEApiContext';

const RS232 = React.forwardRef<IRefRetType, IConfigComponentProps>(
  (compProps: IConfigComponentProps, ref: React.ForwardedRef<IRefRetType>) => {
    const [sendReceive, setSendReceive] = useState<string>('RECEIVE');
    const [isOneWay, setIsOneWay] = useState<boolean>(false);
    const [is4800bps, setIs4800bps] = useState<boolean>(false);

    const [origSendReceive, setOrigSendReceive] = useState<string | null>(null);
    const [origIsOneWay, setOrigIsOneWay] = useState<boolean | null>(null);
    const [origIs4800bps, setOrigIs4800bps] = useState<boolean | null>(null);

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
      if (origSendReceive !== sendReceive) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'RS232',
            'rs232mode',
            sendReceive,
            updateFromWiRoc,
          );
        } else {
          console.log('RS232:save:1 not connected to device');
        }
      }

      if (origIsOneWay !== isOneWay) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'RS232',
            'rs232onewayreceive',
            isOneWay ? '1' : '0',
            updateFromWiRoc,
          );
        } else {
          console.log('RS232:save:2 not connected to device');
        }
      }

      if (origIs4800bps !== is4800bps) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'RS232',
            'forcers2324800baudrate',
            is4800bps ? '1' : '0',
            updateFromWiRoc,
          );
        } else {
          console.log('RS232:save:3 not connected to device');
        }
      }
    };

    const updateFromWiRoc = (propName: string, propValue: string) => {
      console.log('RS232:updateFromWiRoc: propName: ' + propName);
      console.log('RS232:updateFromWiRoc: propValue: ' + propValue);
      switch (propName) {
        case 'rs232mode':
          setSendReceive(propValue);
          setOrigSendReceive(propValue);
          break;
        case 'rs232onewayreceive':
          setIsOneWay(parseInt(propValue, 10) !== 0);
          setOrigIsOneWay(parseInt(propValue, 10) !== 0);
          break;
        case 'forcers2324800baudrate':
          setIs4800bps(parseInt(propValue, 10) !== 0);
          setOrigIs4800bps(parseInt(propValue, 10) !== 0);
          break;
      }
    };

    useEffect(() => {
      async function getRS232Settings() {
        if (BLEAPI.connectedDevice !== null) {
          let pc = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'RS232',
            'rs232mode|rs232onewayreceive|forcers2324800baudrate',
            updateFromWiRoc,
          );
          /*
          let pc2 = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'RS232',
            'rs232onewayreceive',
            updateFromWiRoc,
          );
          let pc3 = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'RS232',
            'forcers2324800baudrate',
            updateFromWiRoc,
          );*/
        }
      }
      getRS232Settings();
    }, [BLEAPI, triggerVersion]);

    useEffect(() => {
      if (
        origSendReceive == null ||
        origIsOneWay === null ||
        origIs4800bps === null
      ) {
        return;
      }
      if (
        origSendReceive !== sendReceive ||
        origIsOneWay !== isOneWay ||
        origIs4800bps !== is4800bps
      ) {
        compProps.setIsDirtyFunction(compProps.id, true);
      } else {
        compProps.setIsDirtyFunction(compProps.id, false);
      }
    }, [
      sendReceive,
      isOneWay,
      is4800bps,
      compProps,
      origSendReceive,
      origIsOneWay,
      origIs4800bps,
    ]);

    return (
      <List.Accordion
        title="Seriell RS232"
        id={compProps.id}
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
  },
);

export default RS232;

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
