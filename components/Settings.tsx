import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Button, DataTable} from 'react-native-paper';
import {useActiveWiRocDevice} from '../hooks/useActiveWiRocDevice';
import {useNotify} from '../hooks/useNotify';
import {
  useWiRocPropertyMutation,
  useWiRocPropertyQuery,
} from '../hooks/useWiRocPropertyQuery';
import AddEditSettingsModal from './AddEditSettingsModal';

export default function Settings() {
  const deviceId = useActiveWiRocDevice();

  const notify = useNotify();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentKey, setCurrentKey] = useState<string>('');
  const [currentValue, setCurrentValue] = useState<string>('');
  const [newSetting, setNewSetting] = useState<boolean>(false);

  const {mutate: updateSettings} = useWiRocPropertyMutation(
    deviceId,
    'settings',
    {
      onError: () => {
        notify({type: 'error', message: 'Kunde inte uppdatera'});
      },
    },
  );

  const {data: {settings} = {settings: []}, refetch: fetchOrRefresh} =
    useWiRocPropertyQuery(deviceId, 'settings', {
      enabled: false,
    });

  const editSetting = (keyName: string, keyValue: string) => {
    setCurrentKey(keyName);
    setCurrentValue(keyValue);
    setNewSetting(false);
    setShowModal(true);
  };

  const addSetting = () => {
    setCurrentKey('');
    setCurrentValue('');
    setNewSetting(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const saveSetting = async (
    keyName: string,
    keyValue: string,
  ): Promise<void> => {
    updateSettings({Key: keyName, Value: keyValue});
    setShowModal(false);
  };

  return (
    <>
      <AddEditSettingsModal
        modalVisible={showModal}
        closeModal={closeModal}
        keyName={currentKey}
        value={currentValue}
        saveSetting={saveSetting}
        newSetting={newSetting}
      />
      <View style={styles.container}>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => {
            fetchOrRefresh();
          }}>
          Hämta/Uppdatera listan
        </Button>
        <Button mode="contained" style={styles.button} onPress={addSetting}>
          Lägg till nytt nyckelvärde
        </Button>
        <ScrollView
          horizontal={true}
          contentContainerStyle={{paddingBottom: 60}}>
          <View style={styles.tableContainer}>
            <DataTable style={(styles.table, {width: 600})}>
              <DataTable.Header style={styles.row}>
                <DataTable.Title style={{flex: 5}}>Nyckel</DataTable.Title>
                <DataTable.Title style={{flex: 5}}>Värde</DataTable.Title>
                <DataTable.Title style={{flex: 3}}> </DataTable.Title>
              </DataTable.Header>
              <ScrollView>
                {settings?.map(setting => (
                  <DataTable.Row key={setting.Key} style={styles.row}>
                    <DataTable.Cell style={{flex: 5}}>
                      {setting.Key}
                    </DataTable.Cell>
                    <DataTable.Cell style={{flex: 5}}>
                      {setting.Value}
                    </DataTable.Cell>
                    <DataTable.Cell style={{flex: 3}}>
                      <Button
                        icon=""
                        mode="contained"
                        onPress={() => {
                          editSetting(setting.Key, setting.Value);
                        }}>
                        Ändra
                      </Button>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </ScrollView>
            </DataTable>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
/*
 */
const styles = StyleSheet.create({
  table: {
    paddingRight: 0,
    marginRight: 0,
  },
  row: {
    paddingRight: 5,
    paddingLeft: 10,
  },
  scrollview: {
    flex: 1,
  },
  tableContainer: {
    flex: 1,
    height: '100%',
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
