import {useQuery, useQueryClient} from '@tanstack/react-query';
import React, {useEffect, useRef, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';
import {Button, DataTable, Divider, Icon, TextInput} from 'react-native-paper';

import {TestPunch} from '@api/types';
import {useActiveWiRocDevice} from '@lib/hooks/useActiveWiRocDevice';
import {useNotify} from '@lib/hooks/useNotify';
import {useStore} from '@store';

export default function SendPunches() {
  const deviceId = useActiveWiRocDevice();
  const queryClient = useQueryClient();
  const apiBackend = useStore(state => state.wiRocDevices[deviceId].apiBackend);
  const [siCardNo, setSiCardNo] = useState<string>('16777215');
  const [numberOfPunches, setNumberOfPunches] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [sendInterval, setSendInterval] = useState(1000);
  const stateRef = useRef<TestPunch[]>();
  const notify = useNotify();

  const {data: punches = []} = useQuery<unknown, unknown, TestPunch[]>({
    queryKey: [deviceId, 'testPunches'],
    queryFn: async () => {
      // The device will stream punches to us.
      // Managed inside useReactQuerySubscription.
      return [];
    },
    staleTime: Infinity,
  });

  // make stateRef always have the current punches
  stateRef.current = punches;

  const sendNumberList = [
    {key: '1', value: '1'},
    {key: '2', value: '2'},
    {key: '3', value: '3'},
    {key: '4', value: '4'},
    {key: '5', value: '5'},
    {key: '6', value: '6'},
    {key: '7', value: '7'},
    {key: '8', value: '8'},
    {key: '10', value: '10'},
    {key: '15', value: '15'},
    {key: '20', value: '20'},
    {key: '30', value: '30'},
    {key: '50', value: '50'},
    {key: '100', value: '100'},
  ];
  const sendIntervalList = [
    {key: '500', value: '0,5 s'},
    {key: '1000', value: '1 s'},
    {key: '1500', value: '1,5 s'},
    {key: '2000', value: '2 s'},
    {key: '3000', value: '3 s'},
    {key: '4000', value: '4 s'},
    {key: '5000', value: '5 s'},
    {key: '10000', value: '10 s'},
    {key: '15000', value: '15 s'},
  ];

  useEffect(() => {
    let ackReq = true; // todo: use real value?
    let completedPunches = punches.filter(punch => {
      return (
        (punch.Status === 'Acked' && ackReq) ||
        (punch.Status === 'Not acked' && !ackReq) ||
        (punch.NoOfSendTries > 1 &&
          (punch.Status === 'Not sent' || punch.Status === 'Not acked'))
      );
    });

    let noOfCompletedRows = completedPunches.length;
    if (
      punches.length === numberOfPunches &&
      numberOfPunches === noOfCompletedRows
    ) {
      // all received, stop listening
      apiBackend.stopWatchingTestPunches();
      setIsSending(false);
    }
  }, [punches, numberOfPunches, deviceId, apiBackend]);

  const startStopSendPunches = async () => {
    if (isSending) {
      apiBackend.stopWatchingTestPunches();
      setIsSending(false);
    } else {
      if (!siCardNo || siCardNo.length === 0 || isNaN(parseInt(siCardNo, 10))) {
        notify({
          message: 'SI Nummer måste fyllas i',
          type: 'info',
        });
        return;
      }

      queryClient.setQueryData([deviceId, 'testPunches'], []);
      apiBackend.startWatchingTestPunches();
      apiBackend.startSendingTestPunches({
        numberOfPunches,
        sendInterval,
        siCardNo,
      });

      setIsSending(true);
    }
  };

  const getStatusDisplayName = (status: String) => {
    switch (status) {
      case 'Acked':
        return 'Bekr.';
      case 'Not Acked':
        return 'Ej bekr.';
      case 'Sent':
        return 'Skickad';
      case 'Not added':
        return 'Ej till.';
      case 'Added':
        return 'Tillagd';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerRow}>
        <TextInput
          value={siCardNo}
          label="SportIdent-nummer"
          onChangeText={text => {
            if (text === '') {
              setSiCardNo('');
            }
            const siNumberParsed = parseInt(text, 10);
            if (!isNaN(siNumberParsed)) {
              setSiCardNo(siNumberParsed.toString());
            }
          }}
          keyboardType="number-pad"
          style={{flex: 1, backgroundColor: 'white'}}
        />
        <SelectList
          setSelected={(val: string) => {
            setNumberOfPunches(parseInt(val, 10));
          }}
          data={sendNumberList}
          save="key"
          search={false}
          placeholder={'Antal'}
          dropdownTextStyles={{fontSize: 30, flex: 1}}
          dropdownStyles={{backgroundColor: 'white'}}
          inputStyles={{
            fontSize: 18,
            fontWeight: '900',
          }}
          boxStyles={{
            width: 150,
            alignItems: 'center',
            height: 60,
            marginRight: 0,
            marginLeft: 5,
          }}
          arrowicon={<Icon source="chevron-down" size={35} color={'black'} />}
          defaultOption={{key: '1', value: '1'}}
        />
      </View>
      <View style={styles.containerRow}>
        <SelectList
          setSelected={(val: string) => {
            setSendInterval(parseInt(val, 10));
          }}
          data={sendIntervalList}
          save="key"
          search={false}
          placeholder={'Interval'}
          dropdownTextStyles={{fontSize: 30, flex: 1}}
          dropdownStyles={{backgroundColor: 'white'}}
          inputStyles={{
            fontSize: 18,
            fontWeight: '900',
          }}
          boxStyles={{
            width: 150,
            alignItems: 'center',
            height: 60,
            marginRight: 5,
            marginLeft: 0,
          }}
          arrowicon={<Icon source="chevron-down" size={35} color={'black'} />}
          defaultOption={{key: '500', value: '0,5 s'}}
        />
        <Button
          icon=""
          loading={isSending}
          mode="contained"
          onPress={startStopSendPunches}
          style={[styles.button, {flex: 1, marginRight: 0}]}>
          {isSending ? 'Sluta skicka' : 'Skicka'}
        </Button>
      </View>
      <Divider bold={true} style={{marginTop: 5, height: 2}} />
      <View style={styles.tableContainer}>
        <DataTable style={styles.table}>
          <DataTable.Header style={styles.row}>
            <DataTable.Title textStyle={{fontSize: 20}} style={{flex: 14}}>
              SI Nr
            </DataTable.Title>
            <DataTable.Title
              textStyle={{fontSize: 20}}
              style={{flex: 11, justifyContent: 'center'}}>
              Tid
            </DataTable.Title>
            <DataTable.Title
              textStyle={{fontSize: 20}}
              style={(styles.centered, {flex: 7})}>
              RSSI
            </DataTable.Title>
            <DataTable.Title
              textStyle={{fontSize: 20}}
              style={(styles.centered, {flex: 7})}>
              Förs.
            </DataTable.Title>
            <DataTable.Title
              textStyle={{fontSize: 20}}
              style={(styles.centered, {flex: 10})}>
              Status
            </DataTable.Title>
          </DataTable.Header>
          <Divider bold={true} />
          <ScrollView contentContainerStyle={{flexGrow: 1}} style={{}}>
            <View>
              {punches.map(punch => (
                <DataTable.Row key={punch.Id} style={styles.row}>
                  <DataTable.Cell textStyle={{fontSize: 22}} style={{flex: 14}}>
                    {punch.SINo}
                  </DataTable.Cell>
                  <DataTable.Cell
                    textStyle={{fontSize: 22}}
                    style={(styles.centered, {flex: 12})}>
                    {punch.Time}
                  </DataTable.Cell>
                  <DataTable.Cell
                    textStyle={{fontSize: 22}}
                    style={{flex: 6, justifyContent: 'center'}}>
                    {punch.RSSI}
                  </DataTable.Cell>
                  <DataTable.Cell
                    textStyle={{fontSize: 22}}
                    style={[
                      punch.NoOfSendTries > 1
                        ? styles.failure
                        : punch.Status === 'Acked'
                        ? styles.success
                        : styles.centered,
                      {flex: 7},
                    ]}>
                    {punch.NoOfSendTries}
                  </DataTable.Cell>
                  <DataTable.Cell
                    textStyle={{fontSize: 22}}
                    style={[
                      punch.Status === 'Acked'
                        ? styles.success
                        : punch.Status === 'Not acked'
                        ? styles.failure
                        : styles.centered,
                      {flex: 10},
                    ]}>
                    {getStatusDisplayName(punch.Status)}
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
              <Divider bold={true} />
              <DataTable.Row key={'footer'} style={styles.row}>
                <DataTable.Cell textStyle={{fontSize: 22}} style={{flex: 31}}>
                  Procent lyckade
                </DataTable.Cell>
                <DataTable.Cell
                  textStyle={{fontSize: 22}}
                  style={{flex: 8, justifyContent: 'center'}}>
                  {Math.round(
                    (100 * punches.filter(p => p.Status === 'Acked').length) /
                      punches
                        .map(p => p.NoOfSendTries)
                        .reduce((a, b) => a + b, 0),
                  )}
                  {'%'}
                </DataTable.Cell>
                <DataTable.Cell
                  textStyle={{fontSize: 22}}
                  style={{flex: 10, justifyContent: 'center'}}>
                  {Math.round(
                    (100 * punches.filter(p => p.Status === 'Acked').length) /
                      punches.length,
                  )}
                  {'%'}
                </DataTable.Cell>
              </DataTable.Row>
            </View>
          </ScrollView>
        </DataTable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    paddingRight: 0,
    marginRight: 0,
    flex: 1,
  },
  row: {
    paddingRight: 5,
    paddingLeft: 5,
  },
  tableContainer: {
    paddingRight: 0,
    marginTop: 0,
    backgroundColor: 'white',
    flex: 1,
  },
  success: {
    backgroundColor: 'palegreen',
    justifyContent: 'center',
  },
  failure: {
    backgroundColor: 'salmon',
    justifyContent: 'center',
  },
  centered: {
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingLeft: 5,
    paddingTop: 0,
    paddingRight: 5,
    paddingBottom: 0,
    backgroundColor: 'white',
  },
  containerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 0,
    paddingTop: 8,
    paddingRight: 0,
    paddingBottom: 0,
    backgroundColor: 'white',
  },
  button: {
    padding: 10,
  },
});
