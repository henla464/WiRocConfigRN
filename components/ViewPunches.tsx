import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Button, DataTable} from 'react-native-paper';

export default function ViewPunches() {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [punches, setPunches] = useState([
    {
      Id: 1,
      StationNumber: 250,
      SICardNumber: 102121,
      Time: '20:30',
    },
    {
      Id: 2,
      StationNumber: 250,
      SICardNumber: 102121,
      Time: '20:30',
    },
    {
      Id: 3,
      StationNumber: 250,
      SICardNumber: 102121,
      Time: '20:30',
    },
    {
      Id: 3,
      StationNumber: 250,
      SICardNumber: 102121,
      Time: '20:30',
    },
    {
      Id: 3,
      StationNumber: 250,
      SICardNumber: 102121,
      Time: '20:30',
    },
    {
      Id: 3,
      StationNumber: 250,
      SICardNumber: 102121,
      Time: '20:30',
    },
    {
      Id: 3,
      StationNumber: 250,
      SICardNumber: 102121,
      Time: '20:30',
    },
    {
      Id: 3,
      StationNumber: 250,
      SICardNumber: 102121,
      Time: '20:30',
    },
    {
      Id: 3,
      StationNumber: 250,
      SICardNumber: 102121,
      Time: '20:30',
    },
    {
      Id: 3,
      StationNumber: 250,
      SICardNumber: 102121,
      Time: '20:30',
    },
    {
      Id: 3,
      StationNumber: 250,
      SICardNumber: 102121,
      Time: '20:30',
    },
    {
      Id: 3,
      StationNumber: 250,
      SICardNumber: 102121,
      Time: '20:30',
    },
    {
      Id: 3,
      StationNumber: 250,
      SICardNumber: 102121,
      Time: '20:30',
    },
    {
      Id: 3,
      StationNumber: 250,
      SICardNumber: 102121,
      Time: '20:30',
    },
    {
      Id: 3,
      StationNumber: 250,
      SICardNumber: 102121,
      Time: '20:30',
    },
    {
      Id: 3,
      StationNumber: 250,
      SICardNumber: 102121,
      Time: '20:30',
    },
  ]);

  const startStopViewPunches = async () => {
    if (isListening) {
      setIsListening(false);
    } else {
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
    paddingBottom: 5,
    backgroundColor: 'lightgray',
  },
  button: {
    padding: 10,
    margin: 10,
    marginLeft: 0,
  },
});
