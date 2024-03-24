import React, {useEffect, useState} from 'react';
import {Alert, Modal, StyleSheet, Text, View} from 'react-native';
import {Button, TextInput} from 'react-native-paper';

interface ISettingsModalProps {
  modalVisible: boolean;
  closeModal: () => void;
  saveSetting: (key: string, value: string) => void;
  keyName: string;
  value: string;
  newSetting: boolean;
}

export default function AddEditSettingsModal({
  modalVisible,
  closeModal,
  saveSetting,
  keyName,
  value,
  newSetting,
}: ISettingsModalProps) {
  const [currentKey, setCurrentKey] = useState<string>(keyName);
  const [currentValue, setCurrentValue] = useState<string>(value);
  useEffect(() => {
    setCurrentKey(keyName);
    setCurrentValue(value);
  }, [keyName, value]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        closeModal();
      }}
      onShow={() => {
        setCurrentKey(keyName);
        setCurrentValue(value);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            {newSetting ? 'Lägg till nytt nyckelvärde' : 'Ändra inställning'}
          </Text>
          <TextInput
            value={currentKey}
            style={styles.textInput}
            label="Nyckel"
            onChangeText={(text: string) => {
              setCurrentKey(text);
            }}
          />
          <TextInput
            value={currentValue}
            style={styles.textInput}
            label="Värde"
            onChangeText={(text: string) => {
              setCurrentValue(text);
            }}
          />
          <View style={styles.containerRow}>
            <Button
              mode="contained"
              style={styles.button}
              onPress={() => saveSetting(currentKey, currentValue)}>
              Spara
            </Button>
            <Button
              mode="contained"
              style={styles.button}
              onPress={() => closeModal()}>
              Avbryt
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingLeft: 30,
    paddingTop: 30,
    paddingRight: 30,
    paddingBottom: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'left',
  },
  containerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 5,
    backgroundColor: 'white',
  },
  button: {
    marginLeft: 10,
    marginRight: 10,
  },
  textInput: {
    margin: 10,
  },
});
