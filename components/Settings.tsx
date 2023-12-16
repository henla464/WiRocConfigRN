import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Button, DataTable} from 'react-native-paper';

interface ISettings {
  Key: string;
  Value: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<ISettings[]>([
    {Key: 'NoOfRetries', Value: '3'},
    {Key: 'LoraMode', Value: 'RECEIVER'},
  ]);

  const editSetting = async () => {};

  return (
    <View style={styles.container}>
      <View style={styles.tableContainer}>
        <DataTable style={styles.table}>
          <DataTable.Header style={styles.row}>
            <DataTable.Title>Nyckel</DataTable.Title>
            <DataTable.Title>Värde</DataTable.Title>
            <DataTable.Title> </DataTable.Title>
          </DataTable.Header>
          <ScrollView>
            {settings.map(setting => (
              <DataTable.Row key={setting.Key} style={styles.row}>
                <DataTable.Cell>{setting.Key}</DataTable.Cell>
                <DataTable.Cell>{setting.Value}</DataTable.Cell>
                <DataTable.Cell>
                  <Button icon="" mode="contained" onPress={editSetting}>
                    Ändra
                  </Button>
                </DataTable.Cell>
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
