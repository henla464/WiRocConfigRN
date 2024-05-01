import React from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';
import {Button} from 'react-native-paper';

interface IInformationModalProps {
  modalVisible: boolean;
  closeModal: () => void;
  message: string;
}

export default function InformationModal({
  modalVisible,
  closeModal,
  message,
}: IInformationModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        closeModal();
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{message}</Text>
          <View style={styles.containerRow}>
            <Button
              mode="contained"
              style={styles.button}
              onPress={() => closeModal()}>
              Stäng
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
    backgroundColor: 'rgb(255, 251, 255)',
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
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 5,
  },
  button: {
    marginLeft: 10,
    marginRight: 10,
  },
});
