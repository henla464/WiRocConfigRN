import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {Button, ProgressBar, Text, TextInput} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {RootStackParamList} from 'src/app/types';

import {useNotify} from '@lib/hooks/useNotify';
import {useToasts} from '@lib/hooks/useToasts';
import {
  useWiRocPropertyMutation,
  useWiRocPropertyQuery,
} from '@lib/hooks/useWiRocPropertyQuery';

type Props = NativeStackScreenProps<RootStackParamList, 'DeviceNetworkDetails'>;

export const DeviceNetworkDetailsScreen = (props: Props) => {
  const {t} = useTranslation();
  const {deviceId, networkName} = props.route.params;
  const notify = useNotify();
  const {addToast} = useToasts();
  const {data: deviceName} = useWiRocPropertyQuery(deviceId, 'wirocdevicename');
  const {
    data: wifiNetworks = [],
    refetch: refetchWifiNetworks,
    isRefetching: isRefetchingWifiNetworks,
  } = useWiRocPropertyQuery(deviceId, 'listwifi');
  const {refetch: refetchIp, isRefetching: isRefetchingIp} =
    useWiRocPropertyQuery(deviceId, 'ip');

  const wifiNetwork = wifiNetworks.find(
    network => network.networkName === networkName,
  );

  const {mutate: wifiConnect, isPending: isConnecting} =
    useWiRocPropertyMutation(deviceId, 'connectwifi', {
      onError: () => {
        notify({
          type: 'error',
          message:
            t('Anslutningen till') +
            ` ${wifiNetwork?.networkName} ` +
            t('misslyckades'),
        });
      },
      onSuccess: () => {
        const name = wifiNetwork?.networkName ?? 'nätverket';
        const dName = deviceName ?? 'Enheten';
        addToast({
          message: t('{{device}} is now connected to {{network}}', {
            device: dName,
            network: name,
          }),
        });
      },
      onSettled: () => {
        refetchWifiNetworks();
        refetchIp();
        props.navigation.goBack();
      },
    });

  useEffect(() => {
    props.navigation.setOptions({
      title: wifiNetwork
        ? t('Anslut till') + ` ${wifiNetwork.networkName}`
        : t('Okänt nätverk'),
    });
  }, [props.navigation, wifiNetwork]);

  const [password, setPassword] = useState('');
  const [isPasswordHidden, setPasswordHidden] = useState(true);

  const connect = () => {
    wifiConnect({networkName, password});
  };

  const isLoading = isRefetchingWifiNetworks || isRefetchingIp || isConnecting;
  return (
    <>
      <SafeAreaView>
        <ScrollView stickyHeaderIndices={[0]}>
          <ProgressBar visible={isLoading} indeterminate />
          <View style={{padding: 16, gap: 16}}>
            {!wifiNetwork?.isConnected ? (
              <>
                <Text variant="bodyLarge">
                  {t('Signalstyrka')}: {wifiNetwork?.signalStrength}
                </Text>
                <TextInput
                  value={password}
                  disabled={isConnecting}
                  autoFocus
                  onSubmitEditing={connect}
                  label={t('Password')}
                  secureTextEntry={isPasswordHidden}
                  onChangeText={(text: string) => {
                    setPassword(text);
                  }}
                  right={
                    <TextInput.Icon
                      icon="eye"
                      onPress={() => setPasswordHidden(!isPasswordHidden)}
                    />
                  }
                />
                <Button
                  mode="contained"
                  onPress={connect}
                  disabled={isConnecting}
                  loading={isConnecting}
                  style={{
                    alignSelf: 'center',
                  }}>
                  {isConnecting ? t('Ansluter') : t('Anslut')}
                </Button>
              </>
            ) : undefined}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};
