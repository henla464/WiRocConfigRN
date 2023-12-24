import React, {useEffect, useImperativeHandle, useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {Icon, List, SegmentedButtons} from 'react-native-paper';
import IConfigComponentProps from '../interface/IConfigComponentProps';
import OnOffChip from './OnOffChip';
import IRefRetType from '../interface/IRefRetType';
import {useBLEApiContext} from '../context/BLEApiContext';

const SRR = React.forwardRef<IRefRetType, IConfigComponentProps>(
  (compProps: IConfigComponentProps, ref: React.ForwardedRef<IRefRetType>) => {
    const [isSRREnabled, setIsSRREnabled] = useState<boolean>(true);
    const [SRRMode, setSRRMode] = useState<string>('RECEIVE');
    const [isRedChannelEnabled, setIsRedChannelEnabled] =
      useState<boolean>(true);
    const [isBlueChannelEnabled, setIsBlueChannelEnabled] =
      useState<boolean>(true);
    const [isRedChannelListenOnly, setIsRedChannelListenOnly] =
      useState<boolean>(true);
    const [isBlueChannelListenOnly, SetIsBlueChannelListenOnly] =
      useState<boolean>(true);

    const [origIsSRREnabled, setOrigIsSRREnabled] = useState<boolean | null>(
      null,
    );
    const [origSRRMode, setOrigSRRMode] = useState<string | null>(null);
    const [origIsRedChannelEnabled, setOrigIsRedChannelEnabled] = useState<
      boolean | null
    >(null);
    const [origIsBlueChannelEnabled, setOrigIsBlueChannelEnabled] = useState<
      boolean | null
    >(null);
    const [origIsRedChannelListenOnly, setOrigIsRedChannelListenOnly] =
      useState<boolean | null>(null);
    const [origIsBlueChannelListenOnly, SetOrigIsBlueChannelListenOnly] =
      useState<boolean | null>(null);

    useImperativeHandle(ref, () => {
      return {
        save: () => {
          save();
        },
      };
    });

    const BLEAPI = useBLEApiContext();

    const save = () => {
      if (origIsSRREnabled !== isSRREnabled) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'srr/enabled',
            isSRREnabled ? '1' : '0',
          );
        } else {
          console.log('SRR:save:1 not connected to device');
        }
      }

      if (origSRRMode !== SRRMode) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(BLEAPI.connectedDevice, 'srr/mode', SRRMode);
        } else {
          console.log('SRR:save:2 not connected to device');
        }
      }

      if (origIsRedChannelEnabled !== isRedChannelEnabled) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'srr/redchannel',
            isRedChannelEnabled ? '1' : '0',
          );
        } else {
          console.log('SRR:save:3 not connected to device');
        }
      }

      if (origIsBlueChannelEnabled !== isBlueChannelEnabled) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'srr/bluechannel',
            isBlueChannelEnabled ? '1' : '0',
          );
        } else {
          console.log('SRR:save:4 not connected to device');
        }
      }

      if (origIsRedChannelListenOnly !== isRedChannelListenOnly) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'srr/redchannellistenonly',
            isRedChannelListenOnly ? '1' : '0',
          );
        } else {
          console.log('SRR:save:5 not connected to device');
        }
      }

      if (origIsBlueChannelListenOnly !== isBlueChannelListenOnly) {
        if (BLEAPI.connectedDevice) {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'srr/bluechannellistenonly',
            isBlueChannelListenOnly ? '1' : '0',
          );
        } else {
          console.log('SRR:save:6 not connected to device');
        }
      }
    };

    const updateFromWiRoc = (propName: string, propValue: string) => {
      console.log('SRR:updateFromWiRoc: propName: ' + propName);
      console.log('SRR:updateFromWiRoc: propValue: ' + propValue);
      switch (propName) {
        case 'srr/enabled':
          setIsSRREnabled(parseInt(propValue, 10) !== 0);
          setOrigIsSRREnabled(parseInt(propValue, 10) !== 0);
          break;
        case 'srr/mode':
          setSRRMode(propValue);
          setOrigSRRMode(propValue);
          break;
        case 'srr/redchannel':
          setIsRedChannelEnabled(parseInt(propValue, 10) !== 0);
          setOrigIsRedChannelEnabled(parseInt(propValue, 10) !== 0);
          break;
        case 'srr/bluechannel':
          setIsBlueChannelEnabled(parseInt(propValue, 10) !== 0);
          setOrigIsBlueChannelEnabled(parseInt(propValue, 10) !== 0);
          break;
        case 'srr/redchannellistenonly':
          setIsRedChannelListenOnly(parseInt(propValue, 10) !== 0);
          setOrigIsRedChannelListenOnly(parseInt(propValue, 10) !== 0);
          break;
        case 'srr/bluechannellistenonly':
          SetIsBlueChannelListenOnly(parseInt(propValue, 10) !== 0);
          SetOrigIsBlueChannelListenOnly(parseInt(propValue, 10) !== 0);
          break;
      }
    };

    useEffect(() => {
      async function getSRRSettings() {
        if (BLEAPI.connectedDevice !== null) {
          let pc = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'SRR',
            'srr/enabled',
            updateFromWiRoc,
          );
          let pc1 = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'SRR',
            'srr/mode',
            updateFromWiRoc,
          );
          let pc2 = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'SRR',
            'srr/redchannel',
            updateFromWiRoc,
          );
          let pc3 = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'SRR',
            'srr/bluechannel',
            updateFromWiRoc,
          );
          let pc4 = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'SRR',
            'srr/redchannellistenonly',
            updateFromWiRoc,
          );
          let pc5 = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'SRR',
            'srr/bluechannellistenonly',
            updateFromWiRoc,
          );
        }
      }
      getSRRSettings();
    }, [BLEAPI]);

    useEffect(() => {
      if (
        origIsSRREnabled == null ||
        origIsRedChannelEnabled === null ||
        origIsBlueChannelEnabled === null ||
        origIsRedChannelListenOnly === null ||
        origIsBlueChannelListenOnly === null
      ) {
        return;
      }
      if (
        origIsSRREnabled !== isSRREnabled ||
        origIsRedChannelEnabled !== isRedChannelEnabled ||
        origIsBlueChannelEnabled !== isBlueChannelEnabled ||
        origIsRedChannelListenOnly !== isRedChannelListenOnly ||
        origIsBlueChannelListenOnly !== isBlueChannelListenOnly
      ) {
        compProps.setIsDirtyFunction(compProps.id, true);
      } else {
        compProps.setIsDirtyFunction(compProps.id, false);
      }
    }, [
      isSRREnabled,
      isRedChannelEnabled,
      isBlueChannelEnabled,
      isRedChannelListenOnly,
      isBlueChannelListenOnly,
      compProps,
      origIsSRREnabled,
      origIsRedChannelEnabled,
      origIsBlueChannelEnabled,
      origIsRedChannelListenOnly,
      origIsBlueChannelListenOnly,
    ]);

    return (
      <List.Accordion
        title="SportIdent SRR"
        id={compProps.id}
        right={({isExpanded}) => (
          <View style={styles.accordionHeader}>
            <Text>{SRRMode === 'RECEIVE' ? 'Ta emot' : 'Skicka'}</Text>
            <OnOffChip on={isSRREnabled} />
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
              value={isSRREnabled}
              onValueChange={val => setIsSRREnabled(val)}
            />
          </View>
          <SegmentedButtons
            value={SRRMode}
            onValueChange={setSRRMode}
            buttons={[
              {
                icon: 'login',
                value: 'RECEIVE',
                label: 'Ta emot',
              },
              {
                icon: 'pan-horizontal',
                value: 'SEND',
                label: 'Skicka',
              },
            ]}
          />
        </View>
      </List.Accordion>
    );
  },
);

export default SRR;

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
    height: 100,
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
