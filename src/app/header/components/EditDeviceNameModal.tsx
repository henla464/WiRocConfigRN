import React, {useEffect, useState} from 'react';
import {Alert, Modal, StyleSheet, View} from 'react-native';
import {Button, TextInput, Text} from 'react-native-paper';

interface IDeviceNameModalProps {
  modalVisible: boolean;
  closeModal: () => void;
  saveSetting: (deviceName: string) => void;
  deviceName: string;
}

export default function EditDeviceNameModal({
  modalVisible,
  closeModal,
  saveSetting,
  deviceName,
}: IDeviceNameModalProps) {
  const [currentDeviceName, setCurrentDeviceName] =
    useState<string>(deviceName);

  useEffect(() => {
    setCurrentDeviceName(deviceName);
  }, [deviceName]);

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
        setCurrentDeviceName(deviceName);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{'Ändra enhetsnamn'}</Text>
          <TextInput
            value={currentDeviceName}
            style={styles.textInput}
            label="Enhetsnamn"
            onChangeText={(text: string) => {
              setCurrentDeviceName(text);
            }}
          />
          <View style={styles.containerRow}>
            <Button
              mode="contained"
              style={styles.button}
              onPress={() => saveSetting(currentDeviceName)}>
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
