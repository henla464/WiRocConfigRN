import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Button, DataTable, Divider} from 'react-native-paper';
import {useBLEApiContext} from '../context/BLEApiContext';

interface IServices {
  Name: string;
  Status: string;
}

interface IInData {
  TypeName: string;
  InstanceName: string;
}

interface IOutData {
  TypeName: string;
  InstanceName: string;
  MessageInName: string;
  MessageInSubTypeName: string;
  MessageOutName: string;
  MessageOutSubTypeName: string;
  Enabled: string;
}

export default function Status() {
  const BLEAPI = useBLEApiContext();
  const [services, setServices] = useState<IServices[]>([]);
  const [inData, setInData] = useState<IInData[]>([]);
  const [outData, setOutData] = useState<IOutData[]>([]);

  useEffect(() => {
    console.log('Status:useEffect start ' + BLEAPI.connectedDevice);
    if (BLEAPI.connectedDevice) {
      console.log('Status:useEffect 2');
      BLEAPI.requestProperty(
        BLEAPI.connectedDevice,
        'Status',
        'services',
        (propName, propValue) => {
          let servicesObj = JSON.parse(propValue);
          setServices(servicesObj.services);
        },
      );

      BLEAPI.requestProperty(
        BLEAPI.connectedDevice,
        'Status',
        'status',
        (propName, propValue) => {
          let statusObj = JSON.parse(propValue);
          setInData(statusObj.inputAdapters);
          setOutData(statusObj.subscriberAdapters);
        },
      );
    }
  }, [BLEAPI]);

  const uploadDatabaseAndLogs = async () => {
    if (BLEAPI.connectedDevice) {
      BLEAPI.requestProperty(
        BLEAPI.connectedDevice,
        'Status',
        'uploadlogarchive',
        (propName, propValue) => {
          if (propName === 'uploadlogarchive') {
            console.log('Database:uploadlogarchive: ' + propValue);
          }
        },
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerRow}>
        <Button
          icon=""
          mode="contained"
          onPress={uploadDatabaseAndLogs}
          style={[styles.button, {flex: 1, marginRight: 0, marginTop: 30}]}>
          Ladda upp databas och loggar
        </Button>
      </View>
      <ScrollView>
        <Text style={styles.header}>Services</Text>
        <View style={styles.tableContainer}>
          <DataTable style={styles.table}>
            <DataTable.Header style={styles.row}>
              <DataTable.Title>Namn</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
            </DataTable.Header>
            {services.map(service => (
              <DataTable.Row key={service.Name} style={styles.row}>
                <DataTable.Cell>{service.Name}</DataTable.Cell>
                <DataTable.Cell>{service.Status}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </View>

        <Divider
          bold={true}
          style={{borderWidth: 0.5, borderColor: 'gray', marginBottom: 5}}
        />
        <Text style={styles.header}>Indata</Text>
        <View style={styles.tableContainer}>
          <DataTable style={styles.table}>
            <DataTable.Header style={styles.row}>
              <DataTable.Title>Indata adapter</DataTable.Title>
              <DataTable.Title>Instans</DataTable.Title>
            </DataTable.Header>
            {inData.map(inD => (
              <DataTable.Row key={inD.TypeName} style={styles.row}>
                <DataTable.Cell>{inD.TypeName}</DataTable.Cell>
                <DataTable.Cell>{inD.InstanceName}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </View>

        <Divider
          bold={true}
          style={{borderWidth: 0.5, borderColor: 'gray', marginBottom: 5}}
        />
        <Text style={styles.header}>Utdata och transformering</Text>
        <View style={styles.tableContainer}>
          <ScrollView horizontal>
            <DataTable style={(styles.table, {width: 700})}>
              <DataTable.Header style={styles.row}>
                <DataTable.Title>Utdata adapter</DataTable.Title>
                <DataTable.Title>Instans</DataTable.Title>
                <DataTable.Title>Inmed. typ</DataTable.Title>
                <DataTable.Title>Inmed. undertyp</DataTable.Title>
                <DataTable.Title>Utmed. typ</DataTable.Title>
                <DataTable.Title>Utmed. undertyp</DataTable.Title>
                <DataTable.Title>Aktiv</DataTable.Title>
              </DataTable.Header>
              {outData.map((outD, idx) => (
                <DataTable.Row key={idx} style={styles.row}>
                  <DataTable.Cell>{outD.TypeName}</DataTable.Cell>
                  <DataTable.Cell>{outD.InstanceName}</DataTable.Cell>
                  <DataTable.Cell>{outD.MessageInName}</DataTable.Cell>
                  <DataTable.Cell>{outD.MessageInSubTypeName}</DataTable.Cell>
                  <DataTable.Cell>{outD.MessageOutName}</DataTable.Cell>
                  <DataTable.Cell>{outD.MessageOutSubTypeName}</DataTable.Cell>
                  <DataTable.Cell>{outD.Enabled ? 'Ja' : 'Nej'}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </ScrollView>
        </View>
        <Divider
          bold={true}
          style={{borderWidth: 0.5, borderColor: 'gray', marginBottom: 5}}
        />
        <Text style={styles.header}>WiRoc Config loggar</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    paddingRight: 0,
    marginRight: 0,
  },
  row: {
    paddingRight: 5,
    paddingLeft: 10,
  },
  tableContainer: {
    paddingRight: 0,
    marginTop: 0,
    backgroundColor: 'lightgray',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingLeft: 5,
    paddingTop: 0,
    paddingRight: 5,
    paddingBottom: 0,
    backgroundColor: 'lightgray',
  },
  containerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 5,
    backgroundColor: 'lightgray',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    padding: 10,
    margin: 10,
    marginLeft: 0,
  },
});
