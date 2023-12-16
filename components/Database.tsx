import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button} from 'react-native-paper';

export default function Database() {
  const deletePunches = async () => {};

  const dropDatabaseTables = async () => {};

  return (
    <View style={styles.container}>
      <View style={styles.containerRow}>
        <Button
          icon=""
          mode="contained"
          onPress={deletePunches}
          style={[styles.button, {flex: 1, marginRight: 0, marginTop: 30}]}>
          Ta bort stämplingar från databasen
        </Button>
      </View>
      <View style={styles.containerRow}>
        <Button
          icon=""
          mode="contained"
          onPress={dropDatabaseTables}
          style={[styles.button, {flex: 1, marginRight: 0, marginTop: 30}]}>
          Ta bort och skapa om alla databastabeller
        </Button>
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
