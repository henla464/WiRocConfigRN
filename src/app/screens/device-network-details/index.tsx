import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, View} from 'react-native';
import {Button, ProgressBar, Text, TextInput} from 'react-native-paper';
import {RootStackParamList} from 'src/app/types';

import {useNotify} from '@lib/hooks/useNotify';
import {useToasts} from '@lib/hooks/useToasts';
import {
  useWiRocPropertyMutation,
  useWiRocPropertyQuery,
} from '@lib/hooks/useWiRocPropertyQuery';

type Props = NativeStackScreenProps<RootStackParamList, 'DeviceNetworkDetails'>;

export const DeviceNetworkDetailsScreen = (props: Props) => {
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
          message: `Anslutningen till ${wifiNetwork?.networkName} misslyckades`,
        });
      },
      onSuccess: () => {
        const name = wifiNetwork?.networkName ?? 'nätverket';
        const dName = deviceName ?? 'Enheten';
        addToast({message: `${dName} är nu ansluten till ${name}`});
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
        ? `Anslut till ${wifiNetwork.networkName}`
        : 'Okänt nätverk',
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
                  Signalstyrka: {wifiNetwork?.signalStrength}
                </Text>
                <TextInput
                  value={password}
                  disabled={isConnecting}
                  autoFocus
                  onSubmitEditing={connect}
                  label="Password"
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
                  {isConnecting ? 'Ansluter' : 'Anslut'}
                </Button>
              </>
            ) : undefined}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};
