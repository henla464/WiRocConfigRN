import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';
import {Button, DataTable, Icon, TextInput} from 'react-native-paper';
import {RenderProps} from 'react-native-paper/lib/typescript/components/TextInput/types';

export default function SendPunches() {
  const [siCardNo, setSiCardNo] = useState<string>('');
  const [numberOfPunches, setNumberOfPunches] = useState<string>('1');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendInterval, setSendInterval] = useState<string>('1000');
  const [punches, setPunches] = useState([
    {
      Id: 1,
      SubscrId: 1,
      SINo: 102121,
      Time: '20:30',
      RSSI: 120,
      Status: 'Not acked',
      NoOfSendTries: 2,
    },
    {
      Id: 2,
      SubscrId: 1,
      SINo: 102121,
      Time: '20:30',
      RSSI: 120,
      Status: 'Not acked',
      NoOfSendTries: 1,
    },
    {
      Id: 3,
      SubscrId: 1,
      SINo: 102121,
      Time: '20:30',
      RSSI: 120,
      Status: 'Not sent',
      NoOfSendTries: 0,
    },
  ]);
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

  const startStopSendPunches = async () => {
    if (isSending) {
      setIsSending(false);
    } else {
      setIsSending(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerRow}>
        <TextInput
          value={siCardNo}
          label="SI Nummer"
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
          style={{flex: 1}}
        />
        <SelectList
          setSelected={(val: string) => {
            console.log(val);
            setNumberOfPunches(val);
          }}
          data={sendNumberList}
          save="key"
          search={false}
          placeholder={'Antal'}
          dropdownTextStyles={{fontSize: 30, flex: 1}}
          dropdownStyles={{backgroundColor: 'gray'}}
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
            console.log(val);
            setSendInterval(val);
          }}
          data={sendIntervalList}
          save="key"
          search={false}
          placeholder={'Interval'}
          dropdownTextStyles={{fontSize: 30, flex: 1}}
          dropdownStyles={{backgroundColor: 'gray'}}
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
      <View style={styles.tableContainer}>
        <DataTable style={styles.table}>
          <DataTable.Header style={styles.row}>
            <DataTable.Title>SI nummber</DataTable.Title>
            <DataTable.Title>Tid</DataTable.Title>
            <DataTable.Title>RSSI</DataTable.Title>
            <DataTable.Title>Försök</DataTable.Title>
            <DataTable.Title>Status</DataTable.Title>
          </DataTable.Header>

          {punches.map(punch => (
            <DataTable.Row key={punch.Id} style={styles.row}>
              <DataTable.Cell>{punch.SINo}</DataTable.Cell>
              <DataTable.Cell>{punch.Time}</DataTable.Cell>
              <DataTable.Cell>{punch.RSSI}</DataTable.Cell>
              <DataTable.Cell>{punch.NoOfSendTries}</DataTable.Cell>
              <DataTable.Cell>{punch.Status}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </View>
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
  button: {
    padding: 10,
  },
});
