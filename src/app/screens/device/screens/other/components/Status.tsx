import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Button, DataTable, Divider, Switch, Text} from 'react-native-paper';

import {useActiveWiRocDevice} from '@lib/hooks/useActiveWiRocDevice';
import {useNotify} from '@lib/hooks/useNotify';
import {useToasts} from '@lib/hooks/useToasts';
import {
  useWiRocPropertyMutation,
  useWiRocPropertyQuery,
} from '@lib/hooks/useWiRocPropertyQuery';
import {useStore} from '@store';

export default function Status() {
  const logs = useStore(state => state.logs);
  const notify = useNotify();
  const {addToast} = useToasts();
  const [isLogsVisible, setLogsVisible] = useState(false);
  const [isDebugVisible, setDebugVisible] = useState(false);
  const [isWarningVisible, setWarningVisible] = useState(true);
  const [isErrorVisible, setErrorVisible] = useState(true);
  const [isInfoVisible, setInfoVisible] = useState(true);

  const deviceId = useActiveWiRocDevice();
  const {data: {services} = {services: []}, refetch: refetchServices} =
    useWiRocPropertyQuery(deviceId, 'services', {
      enabled: false,
    });

  const {
    data: status,
    refetch: refetchStatus,
    isLoading: isLoadingStatus,
    isRefetching: isRefetchingStatus,
  } = useWiRocPropertyQuery(deviceId, 'status', {
    enabled: false,
  });

  const inData = status?.inputAdapters;
  const outData = status?.subscriberAdapters;

  const {mutate: uploadDatabaseAndLogs, isPending: isUploadingDatabaseAndLogs} =
    useWiRocPropertyMutation(deviceId, 'uploadlogarchive', {
      onSuccess: () => {
        addToast({
          message: 'Databas och loggar laddas upp',
        });
      },
    });

  return (
    <View style={styles.container}>
      <Button
        icon=""
        mode="contained"
        disabled={isUploadingDatabaseAndLogs}
        loading={isUploadingDatabaseAndLogs}
        onPress={() => {
          uploadDatabaseAndLogs();
        }}
        style={[styles.button]}>
        {isUploadingDatabaseAndLogs
          ? 'Laddar upp...'
          : 'Ladda upp enhetens databas och loggar'}
      </Button>
      <Button
        icon=""
        mode="contained"
        disabled={isLoadingStatus || isRefetchingStatus}
        loading={isLoadingStatus || isRefetchingStatus}
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
        {isLoadingStatus || isRefetchingStatus
          ? 'Hämtar statusinformation...'
          : 'Hämta statusinformation'}
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
        {isLogsVisible && (
          <ScrollView horizontal>
            <View>
              <View style={{flexDirection: 'row', gap: 5}}>
                <LogSwitch
                  label="DEBUG"
                  value={isDebugVisible}
                  onValueChange={setDebugVisible}
                />
                <LogSwitch
                  label="INFO"
                  value={isInfoVisible}
                  onValueChange={setInfoVisible}
                />
                <LogSwitch
                  label="WARN"
                  value={isWarningVisible}
                  onValueChange={setWarningVisible}
                />
                <LogSwitch
                  label="ERROR"
                  value={isErrorVisible}
                  onValueChange={setErrorVisible}
                />
              </View>
              {logs
                .filter(log => {
                  if (log.type === 'debug') {
                    return isDebugVisible;
                  }
                  if (log.type === 'info') {
                    return isInfoVisible;
                  }
                  if (log.type === 'warn') {
                    return isWarningVisible;
                  }
                  if (log.type === 'error') {
                    return isErrorVisible;
                  }
                  return true;
                })
                .map(log => {
                  return (
                    <View
                      key={log.id}
                      style={{
                        flexDirection: 'row',
                        gap: 5,
                      }}>
                      <Text
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          fontSize: 9,
                        }}>
                        {log.date.toISOString()}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 9,
                          fontWeight: 'bold',
                          color:
                            log.type === 'error'
                              ? 'red'
                              : log.type === 'warn'
                              ? 'orange'
                              : log.type === 'debug'
                              ? 'gray'
                              : 'black',
                        }}>
                        {log.type.padEnd(5).toUpperCase()}
                      </Text>
                      <Text style={{fontFamily: 'monospace', fontSize: 9}}>
                        {log.args
                          .map(a => {
                            if (typeof a === 'object' || Array.isArray(a)) {
                              return JSON.stringify(a);
                            }
                            return a;
                          })
                          .join(' ')}
                      </Text>
                    </View>
                  );
                })}
            </View>
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
}

interface LogSwitchProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function LogSwitch({label, value, onValueChange}: LogSwitchProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <Text variant="labelMedium">{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
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
