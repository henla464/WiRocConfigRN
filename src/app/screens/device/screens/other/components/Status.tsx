import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Button, DataTable, Divider} from 'react-native-paper';

import {useActiveWiRocDevice} from '@lib/hooks/useActiveWiRocDevice';
import {useNotify} from '@lib/hooks/useNotify';
import {
  useWiRocPropertyMutation,
  useWiRocPropertyQuery,
} from '@lib/hooks/useWiRocPropertyQuery';
import {formatLog} from '@lib/utils/formatLog';
import {useStore} from '@store';

export default function Status() {
  const logs = useStore(state => state.logs);
  const notify = useNotify();
  const [isLogsVisible, setLogsVisible] = useState(false);

  const deviceId = useActiveWiRocDevice();
  const {data: {services} = {services: []}, refetch: refetchServices} =
    useWiRocPropertyQuery(deviceId, 'services', {
      enabled: false,
    });
  const {data: status, refetch: refetchStatus} = useWiRocPropertyQuery(
    deviceId,
    'status',
    {
      enabled: false,
    },
  );

  const inData = status?.inputAdapters;
  const outData = status?.subscriberAdapters;

  const {mutate: uploadDatabaseAndLogs} = useWiRocPropertyMutation(
    deviceId,
    'uploadlogarchive',
  );

  return (
    <View style={styles.container}>
      <Button
        icon=""
        mode="contained"
        onPress={() => {
          uploadDatabaseAndLogs();
        }}
        style={[styles.button]}>
        Ladda upp enhetens databas och loggar
      </Button>
      <Button
        icon=""
        mode="contained"
        onPress={() => {
          try {
            refetchServices({throwOnError: true});
          } catch (err) {
            notify({
              type: 'error',
              message: 'Kunde inte hämta "Services"',
            });
          }
          try {
            refetchStatus({throwOnError: true});
          } catch (err) {
            notify({
              type: 'error',
              message:
                'Kunde inte hämta "Indata" och "Utdata och transformering"',
            });
          }
        }}
        style={[styles.button]}>
        Hämta status information
      </Button>
      <ScrollView>
        <Text style={styles.header}>Services</Text>
        <View style={styles.tableContainer}>
          <DataTable style={styles.table}>
            <DataTable.Header style={styles.row}>
              <DataTable.Title>Namn</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
            </DataTable.Header>
            {services?.map(service => (
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
            {inData?.map(inD => (
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
              {outData?.map((outD, idx) => (
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
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => {
            setLogsVisible(state => !state);
          }}>
          {isLogsVisible ? 'Göm loggar' : 'Visa loggar'}
        </Button>
        {isLogsVisible && <Text>{logs.map(formatLog).join('\n')}</Text>}
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
    marginRight: 0,
  },
});
