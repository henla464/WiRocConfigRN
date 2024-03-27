import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {RefreshControl, SafeAreaView, ScrollView, View} from 'react-native';
import {
  Button,
  Dialog,
  List,
  Portal,
  ProgressBar,
  Surface,
  Text,
  Tooltip,
} from 'react-native-paper';
import {RootStackParamList} from 'src/app/types';

import {Notifications} from '@lib/components/Notifications';
import {Toasts} from '@lib/components/Toasts';
import {useNotify} from '@lib/hooks/useNotify';
import {useToasts} from '@lib/hooks/useToasts';
import {
  useWiRocPropertyMutation,
  useWiRocPropertyQuery,
} from '@lib/hooks/useWiRocPropertyQuery';

type Props = NativeStackScreenProps<RootStackParamList, 'DeviceNetwork'>;

export const DeviceNetworkScreen = (props: Props) => {
  const navigate = props.navigation.navigate;
  const deviceId = props.route.params.deviceId;
  const notify = useNotify();
  const {addToast} = useToasts();
  const [disconnectName, setDisconnectName] = useState<string | null>(null);

  const {data: deviceName} = useWiRocPropertyQuery(deviceId, 'wirocdevicename');
  const {
    data: wifiNetworks = [],
    refetch: refetchWifiNetworks,
    isLoading: isLoadingWifiNetworks,
    isRefetching: isRefetchingWifiNetworks,
  } = useWiRocPropertyQuery(deviceId, 'listwifi');
  const {data: ip, refetch: refetchIp} = useWiRocPropertyQuery(deviceId, 'ip');

  const {mutate: renewIp, isPending: isRenewingIp} = useWiRocPropertyMutation(
    deviceId,
    'renewip',
    {
      onError: (error, networkType) => {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        notify({
          type: 'error',
          message: `Förnya ${networkType} IP failed: ` + msg,
        });
      },
      onSuccess: () => {
        addToast({message: 'Förnya IP lyckades'});
      },
      onSettled: () => {
        refresh();
      },
    },
  );

  const {mutateAsync: wifiDisconnect, isPending: isDisconnecting} =
    useWiRocPropertyMutation(deviceId, 'disconnectwifi', {
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
    });

  const refresh = async () => {
    await refetchWifiNetworks();
    await refetchIp();
  };

  const [isRefreshing, setRefreshing] = useState(false);

  return (
    <>
      <SafeAreaView>
        <ScrollView
          stickyHeaderIndices={[0]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setRefreshing(true);
                refresh().finally(() => {
                  setRefreshing(false);
                });
              }}
            />
          }>
          <ProgressBar
            visible={
              isLoadingWifiNetworks || isRefetchingWifiNetworks || isRenewingIp
            }
            indeterminate
          />
          <Notifications />
          <Toasts />
          <View
            style={{
              flex: 1,
              margin: 16,
              flexDirection: 'column',
              gap: 16,
            }}>
            <Surface style={{padding: 16}}>
              <View style={{gap: 8}}>
                <Text variant="labelLarge">IP-adress</Text>
                {ip ? (
                  <Text variant="bodyLarge">{ip}</Text>
                ) : (
                  <Text variant="bodyLarge" style={{opacity: 0.5}}>
                    Ingen IP-adress
                  </Text>
                )}
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginTop: 16,
                  gap: 16,
                  alignItems: 'flex-start',
                }}>
                <Button
                  mode="outlined"
                  disabled={
                    typeof ip !== 'string' || ip.length === 0 || isRenewingIp
                  }
                  onPress={() => {
                    renewIp('wifi');
                  }}>
                  Förnya WiFi-IP
                </Button>
                <Button
                  disabled={
                    typeof ip !== 'string' || ip.length === 0 || isRenewingIp
                  }
                  onPress={() => {
                    renewIp('ethernet');
                  }}>
                  Förnya ethernet-IP
                </Button>
              </View>
            </Surface>
            <Surface>
              <Text
                style={{
                  marginTop: 16,
                  marginLeft: 16,
                  marginRight: 10,
                }}
                variant="titleSmall">
                WiFi-nätverk
              </Text>
              <List.Section>
                {wifiNetworks.map(wifiNetworkItem => {
                  return (
                    <Tooltip
                      {...props}
                      key={wifiNetworkItem.networkName}
                      title={`Signalstyrka ${wifiNetworkItem.signalStrength}`}>
                      <List.Item
                        disabled={isDisconnecting}
                        title={wifiNetworkItem.networkName}
                        titleStyle={{
                          fontWeight: wifiNetworkItem.isConnected
                            ? 'bold'
                            : 'normal',
                        }}
                        description={
                          wifiNetworkItem.isConnected
                            ? isDisconnecting
                              ? 'Kopplar ifrån...'
                              : 'Ansluten'
                            : ''
                        }
                        onPress={() => {
                          if (wifiNetworkItem.isConnected) {
                            setDisconnectName(wifiNetworkItem.networkName);
                          } else {
                            navigate('DeviceNetworkDetails', {
                              deviceId: deviceId,
                              networkName: wifiNetworkItem.networkName,
                            });
                          }
                        }}
                        left={props => (
                          <List.Icon
                            {...props}
                            icon={
                              wifiNetworkItem.signalStrength > 90
                                ? 'wifi-strength-4'
                                : wifiNetworkItem.signalStrength > 75
                                ? 'wifi-strength-3'
                                : wifiNetworkItem.signalStrength > 50
                                ? 'wifi-strength-2'
                                : wifiNetworkItem.signalStrength > 25
                                ? 'wifi-strength-1'
                                : 'wifi-strength-outline'
                            }
                          />
                        )}
                      />
                    </Tooltip>
                  );
                })}
              </List.Section>
            </Surface>
          </View>
        </ScrollView>
      </SafeAreaView>
      <Portal>
        <Dialog
          visible={disconnectName !== null}
          onDismiss={() => {
            setDisconnectName(null);
          }}>
          <Dialog.Title>Koppla från {disconnectName}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Vill du koppla ifrån {disconnectName} (signalstyrka{' '}
              {
                wifiNetworks.find(n => n.networkName === disconnectName)
                  ?.signalStrength
              }
              )?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setDisconnectName(null);
              }}>
              Avbryt
            </Button>
            <Button
              onPress={() => {
                const name = disconnectName;
                const dName = deviceName ?? 'Enheten';

                wifiDisconnect().then(() => {
                  addToast({
                    message: `${dName} kopplade ifrån ${name}`,
                  });
                  setDisconnectName(null);
                });
              }}>
              Koppla från
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};
