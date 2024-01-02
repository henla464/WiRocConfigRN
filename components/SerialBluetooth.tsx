import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button, Checkbox, DataTable, Icon, List} from 'react-native-paper';
import IConfigComponentProps from '../interface/IConfigComponentProps';
import OnOffChip from './OnOffChip';
import IRefRetType from '../interface/IRefRetType';
import {useBLEApiContext} from '../context/BLEApiContext';
import useInterval from '../hooks/useInterval';

interface IBTSerialDevices {
  Name: string;
  BTAddress: string;
  Status: string; // NotConnected | Connected | ReadError
  Found: string;
}
const SerialBluetooth = React.forwardRef<IRefRetType, IConfigComponentProps>(
  (compProps: IConfigComponentProps, ref: React.ForwardedRef<IRefRetType>) => {
    const [isBTDeviceConfigured, setIsBTDeviceConfigured] =
      useState<boolean>(false);
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [interval, setInterval] = useState<number | null>(null);
    const [isOneWay, setIsOneWay] = useState<boolean>(false);

    const [origIsOneWay, setOrigIsOneWay] = useState<boolean>(false);
    const [serialBTDevices, setSerialBTDevices] = useState<IBTSerialDevices[]>(
      [],
    );

    const [triggerVersion, setTriggerVersion] = useState<number>(0);

    const intervalScanBTDevices = useInterval(startScan, interval);

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

    const save = () => {
      if (BLEAPI.connectedDevice !== null) {
        let pc = BLEAPI.saveProperty(
          BLEAPI.connectedDevice,
          'btserialonewayreceive',
          isOneWay ? '1' : '0',
        );
      }
      reload();
    };

    const reload = () => {
      setTriggerVersion(currentValue => {
        return currentValue + 1;
      });
    };

    const updateFromWiRoc = (propName: string, propValue: string) => {
      console.log('SerialBluetooth:updateFromWiRoc: propName: ' + propName);
      console.log('SerialBluetooth:updateFromWiRoc: propValue: ' + propValue);
      switch (propName) {
        case 'btserialonewayreceive':
          setIsOneWay(parseInt(propValue, 10) !== 0);
          setOrigIsOneWay(parseInt(propValue, 10) !== 0);
          break;
        case 'scanbtaddresses':
          let serialBTDevicesArr: IBTSerialDevices[] = [];
          try {
            serialBTDevicesArr = JSON.parse(propValue);
          } catch (e) {
            BLEAPI.logDebug(
              'SerialBluetooth',
              'updateFromWiRoc',
              'scanbtaddresses reply is probably corrupt',
            );
            return;
          }
          let connectedDeviceIndex = serialBTDevicesArr.findIndex(item => {
            return item.Status === 'Connected';
          });
          setIsBTDeviceConfigured(connectedDeviceIndex >= 0);
          setSerialBTDevices(serialBTDevicesArr);

          break;
        case 'bindrfcomm':
          let serialBTDevicesObject = JSON.parse(propValue);
          let serialBTDevicesArr2: IBTSerialDevices[] =
            serialBTDevicesObject.Value;
          let connectedDeviceIndex2 = serialBTDevicesArr2.findIndex(item => {
            return item.Status === 'Connected';
          });
          setIsBTDeviceConfigured(connectedDeviceIndex2 >= 0);
          setSerialBTDevices(serialBTDevicesArr2);
          break;
      }
    };

    useEffect(() => {
      async function getSerialBTSettings() {
        if (BLEAPI.connectedDevice !== null) {
          let pc = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'SerialBluetooth',
            'btserialonewayreceive',
            updateFromWiRoc,
          );
          let pc2 = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'SerialBluetooth',
            'scanbtaddresses',
            updateFromWiRoc,
          );
        }
      }
      getSerialBTSettings();
    }, [BLEAPI, triggerVersion]);

    useEffect(() => {
      if (origIsOneWay == null) {
        return;
      }
      if (origIsOneWay !== isOneWay) {
        compProps.setIsDirtyFunction(compProps.id, true);
      } else {
        compProps.setIsDirtyFunction(compProps.id, false);
      }
    }, [isOneWay, compProps, origIsOneWay]);

    let noOfScans = useRef<number>(0);
    function startScan() {
      console.log('startScan: noOfScans: ' + noOfScans.current);
      if (BLEAPI.connectedDevice !== null) {
        if (noOfScans.current <= 8) {
          let pc = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'SerialBluetooth',
            'scanbtaddresses',
            updateFromWiRoc,
          );
          noOfScans.current += 1;
        } else {
          noOfScans.current = 0;
          setInterval(null);
          setIsScanning(false);
        }
      }
    }

    const startStopScan = () => {
      if (isScanning) {
        setIsScanning(false);
        setInterval(null);
      } else {
        noOfScans.current = 0;
        setIsScanning(true);
        setInterval(5000);
        startScan();
        console.log('INTERVAL: ' + interval);
      }
    };

    return (
      <List.Accordion
        title="Seriell Bluetooth"
        id={compProps.id}
        right={({isExpanded}) => (
          <View style={styles.accordionHeader}>
            <OnOffChip on={isBTDeviceConfigured} />
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
                setIsOneWay(!isOneWay);
              }}
              labelStyle={styles.checkBoxLabel}
            />
          </View>
        </View>
        <View>
          <Button
            icon=""
            loading={isScanning}
            mode="contained"
            onPress={() => startStopScan()}
            style={styles.scanButton}>
            Sök Bluetooth enheter
          </Button>
        </View>
        <View style={styles.tableContainer}>
          <DataTable style={styles.table}>
            <DataTable.Header style={styles.row}>
              <DataTable.Title>Namn</DataTable.Title>
              <DataTable.Title>BT adress/Status</DataTable.Title>
              <DataTable.Title style={styles.buttonColumnCell}>
                <View>
                  <Text> </Text>
                </View>
              </DataTable.Title>
            </DataTable.Header>

            {serialBTDevices.map(item => (
              <DataTable.Row key={item.BTAddress} style={styles.row}>
                <DataTable.Cell>{item.Name}</DataTable.Cell>
                <DataTable.Cell>
                  <View style={styles.btAddressCell}>
                    <Text numberOfLines={2} ellipsizeMode="tail">
                      {item.BTAddress + '\n' + item.Status}
                    </Text>
                  </View>
                </DataTable.Cell>
                <DataTable.Cell style={styles.buttonCell} numeric>
                  <Button
                    icon=""
                    loading={false}
                    mode="contained"
                    onPress={() => {
                      let arg = item.BTAddress + '\t' + item.Name;
                      if (item.Status === 'Connected') {
                        if (BLEAPI.connectedDevice !== null) {
                          let cmd = 'releaserfcomm';
                          let pc = BLEAPI.saveProperty(
                            BLEAPI.connectedDevice,
                            cmd,
                            arg,
                          );
                        }
                      } else if (item.Status === 'NotConnected') {
                        if (BLEAPI.connectedDevice !== null) {
                          let cmd = 'bindrfcomm';
                          let pc2 = BLEAPI.saveProperty(
                            BLEAPI.connectedDevice,
                            cmd,
                            arg,
                          );
                        }
                      } else if (item.Status === 'ReadError') {
                        console.log('SerialBluetooth:ConnectButton ReadError');
                      }
                    }}
                    style={styles.button}>
                    {item.Status === 'Connected'
                      ? 'Koppla ifrån'
                      : item.Status === 'NotConnected'
                      ? 'Anslut'
                      : 'ReadError'}
                  </Button>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </View>
      </List.Accordion>
    );
  },
);

export default SerialBluetooth;

const styles = StyleSheet.create({
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  table: {
    paddingRight: 0,
    marginRight: 0,
    marginBottom: 20,
  },
  row: {
    paddingRight: 5,
    paddingLeft: 10,
  },
  buttonColumnCell: {
    flex: 0,
    width: 93,
  },
  buttonCell: {
    flex: 0,
  },
  tableContainer: {
    paddingRight: 0,
    marginTop: 0,
    backgroundColor: 'lightgray',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 18,
    paddingTop: 1,
    paddingRight: 10,
    paddingBottom: 0,
    backgroundColor: 'lightgray',
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
  btAddressCell: {
    width: 150,
  },
  button: {
    padding: 1,
    margin: 1,
  },
  scanButton: {
    padding: 10,
    margin: 10,
  },
});
