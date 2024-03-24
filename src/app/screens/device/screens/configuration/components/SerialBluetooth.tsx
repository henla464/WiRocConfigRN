import React, {useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button, Checkbox, DataTable, Icon, List} from 'react-native-paper';

import {useConfigurationProperty} from '@lib/hooks/useConfigurationProperty';
import useInterval from '@lib/hooks/useInterval';
import {
  useWiRocPropertyMutation,
  useWiRocPropertyQuery,
} from '@lib/hooks/useWiRocPropertyQuery';

import {SectionComponentProps} from '../';
import OnOffChip from './OnOffChip';

export default function SerialBluetooth({
  deviceId,
  onDefaultValuesChange,
}: SectionComponentProps) {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [interval, setInterval] = useState<number | null>(null);

  const {data: serialBTDevices = [], refetch: refetchDevices} =
    useWiRocPropertyQuery(deviceId, 'scanbtaddresses', {
      enabled: false, // The scan will be explicitly started by the user
    });

  const {mutate: bindBt} = useWiRocPropertyMutation(deviceId, 'bindrfcomm');
  const {mutate: releaseBt} = useWiRocPropertyMutation(
    deviceId,
    'releaserfcomm',
  );

  const [
    {
      field: {value: isOneWay, onChange: setIsOneWay},
    },
  ] = useConfigurationProperty(
    deviceId,
    'btserialonewayreceive',
    onDefaultValuesChange,
  );

  const isBTDeviceConfigured = serialBTDevices.some(
    device => device.Status === 'Connected',
  );

  const intervalScanBTDevices = useInterval(startScan, interval);

  let noOfScans = useRef<number>(0);

  function startScan() {
    console.log('startScan: noOfScans: ' + noOfScans.current);
    if (noOfScans.current <= 8) {
      refetchDevices();
      noOfScans.current += 1;
    } else {
      noOfScans.current = 0;
      setInterval(null);
      setIsScanning(false);
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
      id="serialBluetooth"
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
                    if (item.Status === 'Connected') {
                      releaseBt(item.BTAddress);
                    } else if (item.Status === 'NotConnected') {
                      bindBt({btAddress: item.BTAddress, btName: item.Name});
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
}

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
