import React, {useEffect, useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Button, Divider, Icon, List, TextInput} from 'react-native-paper';
import {useBLEApiContext} from '../context/BLEApiContext';
import ConnectedChip from './ConnectedChip';
import WifiItem from './WifiItem';

interface IDeviceConnectionModalProps {
  modalVisible: boolean;
  closeModal: () => void;
}

interface IWifiListItem {
  networkName: string;
  isConnected: boolean;
  signalStrength: string;
}

export default function DeviceConnectionModal({
  modalVisible,
  closeModal,
}: IDeviceConnectionModalProps) {
  const BLEAPI = useBLEApiContext();

  const [wifiNetworks, setWifiNetworks] = useState<IWifiListItem[]>([]);
  const [triggerVersion, setTriggerVersion] = useState<number>(0);

  useEffect(() => {
    async function getWifiList() {
      if (BLEAPI.connectedDevice !== null) {
        let pc = BLEAPI.requestProperty(
          BLEAPI.connectedDevice,
          'DeviceConnectionModal',
          'listwifi',
          (propName: string, propValue: string) => {
            if (propName === 'listwifi') {
              let wifiList: IWifiListItem[] = [];
              let rowList = propValue.split(/\r?\n/);
              for (let i = 0; i < rowList.length; i += 3) {
                wifiList.push({
                  networkName: rowList[i],
                  isConnected: rowList[i + 1] === 'yes',
                  signalStrength: rowList[i + 2],
                });
              }
              setWifiNetworks(wifiList);
            }
          },
        );
      }
    }
    getWifiList();
  }, [BLEAPI, triggerVersion]);

  const wifiDisconnect = (networkName: string) => {
    if (BLEAPI.connectedDevice) {
      BLEAPI.requestProperty(
        BLEAPI.connectedDevice,
        'WifiItem',
        'disconnectwifi',
        (propName: string, propValue: string) => {
          console.log(
            'wifiDisconnect: networkName: ' +
              networkName +
              ' propName: ' +
              propName +
              ' value: ' +
              propValue,
          );
        },
      );
    }
  };

  const wifiConnect = (networkName: string, password: string) => {
    if (BLEAPI.connectedDevice) {
      BLEAPI.saveProperty(
        BLEAPI.connectedDevice,
        'connectwifi',
        networkName + '\t' + password,
      );
    }
  };

  const refresh = () => {
    setTriggerVersion(triggerVersion + 1);
  };

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
          <Divider bold={true} />
          <Text style={styles.header}>Wifi nätverk</Text>
          <Button
            loading={false}
            icon=""
            mode="contained"
            style={styles.button}
            onPress={() => {
              refresh();
            }}>
            Uppdatera Wifi listan
          </Button>
          <Divider bold={true} />
          <ScrollView style={styles.scrollView}>
            <List.AccordionGroup>
              <View>
                {wifiNetworks.map((wifiNetworkItem: IWifiListItem) => {
                  return (
                    <WifiItem
                      isConnected={wifiNetworkItem.isConnected}
                      networkName={wifiNetworkItem.networkName}
                      signalStrength={wifiNetworkItem.signalStrength}
                      wifiConnect={wifiConnect}
                      wifiDisconnect={wifiDisconnect}
                      key={wifiNetworkItem.networkName}
                    />
                  );
                })}
              </View>
            </List.AccordionGroup>
          </ScrollView>

          <Button
            loading={false}
            icon=""
            mode="contained"
            style={styles.button}
            onPress={() => {
              closeModal();
            }}>
            Stäng
          </Button>
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
    margin: 15,
    marginTop: 60,
    backgroundColor: 'white',
  },
  modalView: {
    flex: 1,
    width: '100%',
    marginTop: 10,
    padding: 10,
    marginBottom: 30,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 15,
  },
  scrollView: {
    flex: 1,
    width: '100%',
    paddingBottom: 20,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  header: {
    padding: 10,
    fontWeight: 'bold',
    fontSize: 20,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordion: {
    //backgroundColor: 'yellow',
  },
  accordionContent: {
    backgroundColor: 'lightgray',
    padding: 20,
  },
  buttonView: {
    alignItems: 'flex-end',
  },
  textInput: {
    margin: 10,
  },
});
