import React, {useEffect, useState} from 'react';
import {Modal, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Button, Divider, List} from 'react-native-paper';
import {useBLEApiContext} from '../context/BLEApiContext';
import {useLogger} from '../hooks/useLogger';
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
  const logger = useLogger();
  const BLEAPI = useBLEApiContext();

  const [wifiNetworks, setWifiNetworks] = useState<IWifiListItem[]>([]);
  const [ip, setIp] = useState<string>('');
  const [triggerVersion, setTriggerVersion] = useState<number>(0);

  useEffect(() => {
    async function getWifiList() {
      if (modalVisible) {
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

          let pc2 = BLEAPI.requestProperty(
            BLEAPI.connectedDevice,
            'DeviceConnectionModal',
            'ip',
            (propName: string, propValue: string) => {
              if (propName === 'ip') {
                setIp(propValue);
              }
            },
          );
        }
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
          if (propName === 'disconnectwifi' && propValue === 'OK') {
            refresh();
          }
        },
      );
    }
  };

  // should listen to: connectwifi ( value 'OK' )
  const renewWifiIP = () => {
    if (BLEAPI.connectedDevice) {
      BLEAPI.requestProperty(
        BLEAPI.connectedDevice,
        'DeviceConnectionModal',
        'renewip\twifi',
        (propName: string, propValue: string) => {
          if (propName === 'renewip\twifi' && propValue === 'OK') {
            refresh();
          } else {
            logger.error(
              'DeviceConnectionModal',
              'renewWifiIP',
              'renewWifiIP returned: ' + propValue,
            );
            BLEAPI.logErrorForUser('Förnya Wifi IP misslyckades: ' + propValue);
          }
        },
      );
    }
  };

  const renewEthernetIP = () => {
    if (BLEAPI.connectedDevice) {
      BLEAPI.requestProperty(
        BLEAPI.connectedDevice,
        'DeviceConnectionModal',
        'renewip\tethernet',
        (propName: string, propValue: string) => {
          if (propName === 'renewip\tethernet' && propValue === 'OK') {
            refresh();
          } else {
            logger.error(
              'DeviceConnectionModal',
              'renewEthernetIP',
              'renewEthernetIP returned: ' + propValue,
            );
            BLEAPI.logErrorForUser(
              'Förnya ethernet IP misslyckades: ' + propValue,
            );
          }
        },
      );
    }
  };

  const wifiConnect = (networkName: string, password: string) => {
    if (BLEAPI.connectedDevice) {
      BLEAPI.saveProperty(
        BLEAPI.connectedDevice,
        'DeviceConnectionModal',
        'connectwifi',
        networkName + '\t' + password,
        (propName: string, propValue: string) => {
          if (propName === 'connectwifi' && propValue === 'OK') {
            refresh();
          } else {
            logger.error(
              'DeviceConnectionModal',
              'wifiConnect',
              'wifiConnect returned: ' + propValue,
            );
            BLEAPI.logErrorForUser(
              'Ansluta till Wifi nätverket misslyckades: ' + propValue,
            );
          }
        },
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
          <ScrollView style={styles.scrollView}>
            <Text style={styles.header}>IP-adress: {ip}</Text>
            <View style={styles.containerRow}>
              <Button
                loading={false}
                icon=""
                mode="contained"
                style={styles.button2}
                onPress={() => {
                  renewWifiIP();
                }}>
                Förnya Wifi IP
              </Button>
              <Button
                loading={false}
                icon=""
                mode="contained"
                style={styles.button2}
                onPress={() => {
                  renewEthernetIP();
                }}>
                Förnya ethernet IP
              </Button>
            </View>
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
          <View style={styles.containerRowRight}>
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
  button2: {
    borderRadius: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginLeft: 5,
    marginRight: 5,
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
  containerRowRight: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: 10,
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 5,
  },
});
