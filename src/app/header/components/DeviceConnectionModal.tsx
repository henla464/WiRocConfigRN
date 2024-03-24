import React from 'react';
import {Modal, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Button, Divider, List} from 'react-native-paper';

import {useNotify} from '@lib/hooks/useNotify';
import {
  useWiRocPropertyMutation,
  useWiRocPropertyQuery,
} from '@lib/hooks/useWiRocPropertyQuery';

import WifiItem from './WifiItem';

interface IDeviceConnectionModalProps {
  deviceId: string;
  modalVisible: boolean;
  closeModal: () => void;
}

export default function DeviceConnectionModal({
  deviceId,
  modalVisible,
  closeModal,
}: IDeviceConnectionModalProps) {
  const notify = useNotify();

  const {data: wifiNetworks = [], refetch: refetchWifiNetworks} =
    useWiRocPropertyQuery(deviceId, 'listwifi');
  const {data: ip, refetch: refetchIp} = useWiRocPropertyQuery(deviceId, 'ip');

  const {mutate: wifiDisconnect} = useWiRocPropertyMutation(
    deviceId,
    'disconnectwifi',
    {
      onError: error => {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        notify({
          type: 'error',
          message: 'Disconnecting from Wifi network failed: ' + msg,
        });
      },
      onSettled: () => {
        refresh();
      },
    },
  );

  const {mutate: renewIp} = useWiRocPropertyMutation(deviceId, 'renewip', {
    onError: (error, networkType) => {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      notify({
        type: 'error',
        message: `Förnya ${networkType} IP failed: ` + msg,
      });
    },
    onSuccess: () => {
      notify({
        type: 'info',
        message: 'Förnya IP lyckades',
      });
    },
    onSettled: () => {
      refresh();
    },
  });

  const {mutate: wifiConnect} = useWiRocPropertyMutation(
    deviceId,
    'connectwifi',
    {
      onError: error => {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        notify({
          type: 'error',
          message: 'Ansluta till Wifi nätverket misslyckades: ' + msg,
        });
      },
      onSuccess: () => {
        notify({
          type: 'info',
          message: 'Anslutning till Wifi-nätverket lyckades',
        });
      },
      onSettled: () => {
        refresh();
      },
    },
  );

  const refresh = () => {
    refetchWifiNetworks();
    refetchIp();
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
                  renewIp('wifi');
                }}>
                Förnya Wifi IP
              </Button>
              <Button
                loading={false}
                icon=""
                mode="contained"
                style={styles.button2}
                onPress={() => {
                  renewIp('ethernet');
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
                {wifiNetworks.map(wifiNetworkItem => {
                  return (
                    <WifiItem
                      isConnected={wifiNetworkItem.isConnected}
                      networkName={wifiNetworkItem.networkName}
                      signalStrength={wifiNetworkItem.signalStrength}
                      wifiConnect={wifiConnect}
                      wifiDisconnect={wifiName => {
                        wifiDisconnect(undefined, {
                          onSuccess: () => {
                            notify({
                              type: 'info',
                              message: `Kopplade från ${wifiName}`,
                            });
                          },
                        });
                      }}
                      // include signalStrength in key, since network names can sometimes be the same (different requency variants?)
                      key={`${wifiNetworkItem.networkName}-${wifiNetworkItem.signalStrength}`}
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
