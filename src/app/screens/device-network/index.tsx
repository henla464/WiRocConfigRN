import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {RefreshControl, SafeAreaView, ScrollView, View} from 'react-native';
import {useTranslation} from 'react-i18next';
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
  const {t} = useTranslation();
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

  const {data: wifiip, refetch: refetchWifiIp} = useWiRocPropertyQuery(
    deviceId,
    'wifiip',
  );

  const {data: wifiMeshIp, refetch: refetchWifiMeshIp} = useWiRocPropertyQuery(
    deviceId,
    'wifimesh/ipaddress',
  );

  const {data: usbEthernetIp, refetch: refetchUsbEthernetIp} =
    useWiRocPropertyQuery(deviceId, 'usbethernetip');

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
    await refetchWifiIp();
    await refetchWifiMeshIp();
    await refetchUsbEthernetIp();
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
            visible={isLoadingWifiNetworks || isRefetchingWifiNetworks}
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
                <Text variant="labelLarge">{t('Wifi IP-adress')}</Text>
                {wifiip ? (
                  <Text variant="bodyLarge">{wifiip}</Text>
                ) : (
                  <Text variant="bodyLarge" style={{opacity: 0.5}}>
                    {t('Ingen IP-adress')}
                  </Text>
                )}
              </View>
              {wifiMeshIp && (
                <View style={{gap: 8}}>
                  <Text variant="labelLarge">{t('Wifi-mesh IP-adress')}</Text>
                  <Text variant="bodyLarge">{wifiMeshIp}</Text>
                </View>
              )}

              {usbEthernetIp && (
                <View style={{gap: 8}}>
                  <Text variant="labelLarge">
                    {t('USB Ethernet IP-adress')}
                  </Text>
                  <Text variant="bodyLarge">{usbEthernetIp}</Text>
                </View>
              )}
            </Surface>
            <Surface>
              <Text
                style={{
                  marginTop: 16,
                  marginLeft: 16,
                  marginRight: 10,
                }}
                variant="titleSmall">
                {t('WiFi-nätverk')}
              </Text>
              <List.Section>
                {wifiNetworks.map(wifiNetworkItem => {
                  return (
                    <Tooltip
                      {...props}
                      key={wifiNetworkItem.networkName}
                      title={`${t('Signalstyrka')} ${wifiNetworkItem.signalStrength}`}>
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
                              ? t('Kopplar ifrån...')
                              : t('Ansluten')
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
          <Dialog.Title>
            {t('Koppla från')} {disconnectName}
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {t('Vill du koppla ifrån')} {disconnectName} ({t('signalstyrka')}{' '}
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
              {t('Avbryt')}
            </Button>
            <Button
              onPress={() => {
                const name = disconnectName;
                const dName = deviceName ?? 'Enheten';

                wifiDisconnect().then(() => {
                  addToast({
                    message: t('{{device}} disconnected from {{network}}', {
                      device: dName,
                      network: name,
                    }),
                  });
                  setDisconnectName(null);
                });
              }}>
              {t('Koppla från')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};
