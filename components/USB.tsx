import React, {useEffect, useState, useImperativeHandle} from 'react';
import {StyleSheet, View} from 'react-native';
import {Checkbox, Icon, List} from 'react-native-paper';
import IConfigComponentProps from '../interface/IConfigComponentProps';
import OnOffChip from './OnOffChip';
import {useBLEApiContext} from '../context/BLEApiContext';
import IRefRetType from '../interface/IRefRetType';

const USB = React.forwardRef<IRefRetType, IConfigComponentProps>(
  (compProps: IConfigComponentProps, ref: React.ForwardedRef<IRefRetType>) => {
    const [isOneWay, setIsOneWay] = useState<boolean>(false);
    const [is4800bps, setIs4800bps] = useState<boolean>(false);

    const [origIsOneWay, setOrigIsOneWay] = useState<boolean | null>(null);
    const [origIs4800bps, setOrigIs4800bps] = useState<boolean | null>(null);

    useImperativeHandle(ref, () => {
      return {
        save: () => {
          save();
        },
      };
    });

    const BLEAPI = useBLEApiContext();

    const save = () => {
      if (origIsOneWay !== isOneWay) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'onewayreceive',
            isOneWay ? '1' : '0',
          );
        } else {
          console.log('USB:save:1 not connected to device');
        }
      }

      if (origIs4800bps !== is4800bps) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'force4800baudrate',
            is4800bps ? '1' : '0',
          );
        } else {
          console.log('USB:save:2 not connected to device');
        }
      }
    };

    const updateFromWiRoc = (propName: string, propValue: string) => {
      console.log('USB:updateFromWiRoc: propName: ' + propName);
      console.log('USB:updateFromWiRoc: propValue: ' + propValue);
      switch (propName) {
        case 'onewayreceive':
          setIsOneWay(parseInt(propValue, 10) !== 0);
          setOrigIsOneWay(parseInt(propValue, 10) !== 0);
          break;
        case 'force4800baudrate':
          setIs4800bps(parseInt(propValue, 10) !== 0);
          setOrigIs4800bps(parseInt(propValue, 10) !== 0);
          break;
      }
    };

    useEffect(() => {
      async function getUSBSettings() {
        if (BLEAPI.connectedDevice !== null) {
          let pc = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'USB',
            'onewayreceive',
            updateFromWiRoc,
          );
          let pc2 = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'USB',
            'force4800baudrate',
            updateFromWiRoc,
          );
        }
      }
      getUSBSettings();
    }, [BLEAPI]);

    useEffect(() => {
      if (origIsOneWay == null || origIs4800bps === null) {
        return;
      }
      if (origIsOneWay !== isOneWay || origIs4800bps !== is4800bps) {
        compProps.setIsDirtyFunction(compProps.id, true);
      } else {
        compProps.setIsDirtyFunction(compProps.id, false);
      }
    }, [isOneWay, is4800bps, compProps, origIsOneWay, origIs4800bps]);

    return (
      <List.Accordion
        title="USB"
        id={compProps.id}
        key={compProps.id}
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
  },
);

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

export default USB;
