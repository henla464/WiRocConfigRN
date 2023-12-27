import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Button, DataTable} from 'react-native-paper';
import {useBLEApiContext} from '../context/BLEApiContext';
import {IPunch} from '../hooks/useBLE';

export default function ViewPunches() {
  const BLEAPI = useBLEApiContext();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [punches, setPunches] = useState<IPunch[]>([
    {
      Id: 1,
      StationNumber: 250,
      SICardNumber: 102121,
      Time: '20:30',
    },
  ]);

  const updatePunches = (propName: string, propValue: string) => {
    if (propName === 'punches') {
      var punchesObj = JSON.parse(propValue);

      let newPunchArray = punchesObj.punches.map(
        (punch: IPunch, idx: number) => {
          return {
            Id: idx,
            StationNumber: punch.StationNumber,
            SICardNumber: punch.SICardNumber,
            Time: punch.Time,
          };
        },
      );

      setPunches(newPunchArray);
    } else {
      console.log('ViewPunches:updatePunches propName unknown: ' + propName);
    }
  };

  const startStopViewPunches = async () => {
    if (isListening) {
      if (BLEAPI.connectedDevice) {
        BLEAPI.disablePunchesNotification(BLEAPI.connectedDevice);
      }
      setIsListening(false);
    } else {
      if (BLEAPI.connectedDevice) {
        BLEAPI.enablePunchesNotification(BLEAPI.connectedDevice, updatePunches);
      }
      setIsListening(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerRow}>
        <Button
          icon=""
          loading={isListening}
          mode="contained"
          onPress={startStopViewPunches}
          style={[styles.button, {flex: 1, marginRight: 0}]}>
          {isListening ? 'Sluta visa stämplingar' : 'Visa stämplingar'}
        </Button>
      </View>
      <View style={styles.containerRow}>
        <Button
          icon=""
          mode="contained"
          onPress={() => {
            setPunches([]);
          }}
          style={[styles.button, {flex: 1, marginRight: 0}]}>
          Rensa
        </Button>
      </View>
      <View style={styles.tableContainer}>
        <DataTable style={styles.table}>
          <DataTable.Header style={styles.row}>
            <DataTable.Title>Kontrollnummer</DataTable.Title>
            <DataTable.Title>SI-nummer</DataTable.Title>
            <DataTable.Title>Tid</DataTable.Title>
          </DataTable.Header>
          <ScrollView>
            {punches.map(punch => (
              <DataTable.Row key={punch.Id} style={styles.row}>
                <DataTable.Cell>{punch.StationNumber}</DataTable.Cell>
                <DataTable.Cell>{punch.SICardNumber}</DataTable.Cell>
                <DataTable.Cell>{punch.Time}</DataTable.Cell>
              </DataTable.Row>
            ))}
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
    paddingBottom: 0,
    backgroundColor: 'lightgray',
  },
  button: {
    padding: 10,
    margin: 10,
    marginLeft: 0,
  },
});
