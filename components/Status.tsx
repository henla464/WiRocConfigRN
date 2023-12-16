import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Button, DataTable, Divider} from 'react-native-paper';

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
  const [time, setTime] = useState<string>('');
  const [services, setServices] = useState<IServices[]>([
    {Name: 'WiRocPython', Status: 'active'},
    {Name: 'WiRocPythonWS', Status: 'active'},
  ]);
  const [inData, setInData] = useState<IInData[]>([
    {TypeName: 'STATUS', InstanceName: 'status1'},
    {TypeName: 'LORA', InstanceName: 'reclora1'},
  ]);
  const [outData, setOutData] = useState<IOutData[]>([
    {
      TypeName: 'LORA',
      InstanceName: 'sndlora1',
      MessageInSubTypeName: 'SIMessage',
      MessageInName: 'SI',
      MessageOutName: 'LORA',
      MessageOutSubTypeName: 'Punch',
      Enabled: 'true',
    },
    {
      TypeName: 'LORA',
      InstanceName: 'sndlora1',
      MessageInSubTypeName: 'SRRMessage',
      MessageInName: 'SRR',
      MessageOutName: 'LORA',
      MessageOutSubTypeName: 'Punch',
      Enabled: 'true',
    },
  ]);

  const uploadDatabaseAndLogs = async () => {};

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
                <DataTable.Cell>{outD.Enabled}</DataTable.Cell>
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
