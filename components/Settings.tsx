import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Button, DataTable} from 'react-native-paper';
import {useBLEApiContext} from '../context/BLEApiContext';
import AddEditSettingsModal from './AddEditSettingsModal';

interface ISettings {
  Key: string;
  Value: string;
}

export default function Settings() {
  const BLEAPI = useBLEApiContext();
  const [settings, setSettings] = useState<ISettings[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentKey, setCurrentKey] = useState<string>('');
  const [currentValue, setCurrentValue] = useState<string>('');
  const [newSetting, setNewSetting] = useState<boolean>(false);
  const [versionTrigger, setVersionTrigger] = useState<number>(0);

  const updateSettings = useCallback(
    (propName: string, propValue: string) => {
      console.log('Settings:updateSettings start');
      try {
        let settingsObj = JSON.parse(propValue);
        //console.log('Settings:updateSettings: old ' + JSON.stringify(settings));
        console.log(
          'Settings:updateSettings: new ' +
            JSON.stringify(settingsObj.settings),
        );
        setSettings(settingsObj.settings);
      } catch (e) {
        BLEAPI.logError(
          'Settings',
          'updateSettings',
          'fetch settings exception: ' + e,
          '',
        );
        BLEAPI.logErrorForUser('Kunde inte hämta nyckelvärdelistan');
      }
    },
    [setSettings, BLEAPI],
  );

  useEffect(() => {
    if (BLEAPI.connectedDevice) {
      console.log('Settings:useEffect start');
      BLEAPI.requestProperty(
        BLEAPI.connectedDevice,
        'Settings',
        'settings',
        updateSettings,
      );
    }
  }, [BLEAPI, updateSettings, versionTrigger]);

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

  const refresh = () => {
    setVersionTrigger(curState => {
      return curState + 1;
    });
  };

  const saveSetting = async (
    keyName: string,
    keyValue: string,
  ): Promise<void> => {
    if (BLEAPI.connectedDevice) {
      var settingKeyAndValue = keyName + '\t' + keyValue;
      await BLEAPI.saveProperty(
        BLEAPI.connectedDevice,
        'Settings',
        'setting',
        settingKeyAndValue,
        (propName: string, propValue: string) => {
          console.log(
            'Settings propName: ' +
              propName +
              ' propValue: ' +
              propValue +
              ' Implement error handling!',
          );
        },
      );
      refresh();
    }
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
                {settings.map(setting => (
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
