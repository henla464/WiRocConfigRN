import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {
  Button,
  List,
  ProgressBar,
  Surface,
  Text,
} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

import {
  useWiRocPropertyMutation,
  useWiRocPropertyQuery,
} from '@lib/hooks/useWiRocPropertyQuery';

interface EthernetIPsProps {
  deviceId: string;
}

function parseTailscaleIPs(statusJson: string): string[] {
  try {
    const parsed = JSON.parse(statusJson);
    const ips: string[] = [];
    if (parsed?.Self?.TailscaleIPs && Array.isArray(parsed.Self.TailscaleIPs)) {
      ips.push(...parsed.Self.TailscaleIPs);
    }
    return ips;
  } catch {
    return [];
  }
}

export default function EthernetIPs({deviceId}: EthernetIPsProps) {
  const {t} = useTranslation();

  const {data: usbEthernetIp} = useWiRocPropertyQuery(
    deviceId,
    'network/usbethernetip',
  );

  const {data: builtinEthernetIp} = useWiRocPropertyQuery(
    deviceId,
    'network/ethernetip',
  );

  const {data: wifiMeshIp} = useWiRocPropertyQuery(
    deviceId,
    'wifimesh/ipaddress',
  );

  const {data: tailscaleStatus, refetch: refetchTailscaleStatus} =
    useWiRocPropertyQuery(deviceId, 'network/tailscale/status', {
      enabled: false,
    });

  const {refetch: refetchNetworkInterfaces} =
    useWiRocPropertyQuery(deviceId, 'network/interfaces', {
      enabled: false,
    });

  const {mutate: renewIp, isPending: isRenewing} = useWiRocPropertyMutation(
    deviceId,
    'network/renewip',
  );

  const handleRefresh = () => {
    refetchNetworkInterfaces();
    refetchTailscaleStatus();
  };

  const handleRenewIp = () => {
    renewIp('ethernet' as never);
  };

  const tailscaleIps = tailscaleStatus
    ? parseTailscaleIPs(tailscaleStatus)
    : [];

  const hasEthernetIp = !!(builtinEthernetIp || usbEthernetIp);
  const ethernetCount = (builtinEthernetIp ? 1 : 0) + (usbEthernetIp ? 1 : 0);

  const hasAnyIp =
    builtinEthernetIp ||
    usbEthernetIp ||
    wifiMeshIp ||
    tailscaleIps.length > 0;

  const isLoading = isRenewing;

  return (
    <ScrollView>
      <ProgressBar visible={isLoading} indeterminate />
      <View style={styles.container}>
        <Surface style={styles.surface}>
          <View style={{padding: 16, gap: 16}}>
            <Text variant="titleSmall">{t('IP-adresser')}</Text>

            {!hasAnyIp && (
              <Text variant="bodyMedium" style={{opacity: 0.5}}>
                {t('Ingen IP-adress')}
              </Text>
            )}

            <View style={{gap: 8}}>
              {builtinEthernetIp && (
                <View style={styles.ipRow}>
                  <List.Icon icon="ethernet" />
                  <View style={{flex: 1}}>
                    <Text variant="labelMedium">
                      {t('Inbyggt Ethernet')}
                    </Text>
                    <Text variant="bodyLarge">{builtinEthernetIp}</Text>
                  </View>
                </View>
              )}

              {usbEthernetIp && (
                <View style={styles.ipRow}>
                  <List.Icon icon="usb-port" />
                  <View style={{flex: 1}}>
                    <Text variant="labelMedium">
                      {t('USB Ethernet')}
                    </Text>
                    <Text variant="bodyLarge">{usbEthernetIp}</Text>
                  </View>
                </View>
              )}

              {hasEthernetIp && (
                <Button
                  mode="outlined"
                  icon="restart"
                  onPress={handleRenewIp}
                  loading={isRenewing}
                  disabled={isRenewing}
                  style={styles.renewButton}>
                  {ethernetCount === 1
                    ? t('Förnya IP-adress')
                    : t('Förnya IP-adresser')}
                </Button>
              )}
            </View>

            {wifiMeshIp && (
              <View style={styles.ipRow}>
                <List.Icon icon="wifi-sync" />
                <View style={{flex: 1}}>
                  <Text variant="labelMedium">
                    {t('Wifi-mesh IP-adress')}
                  </Text>
                  <Text variant="bodyLarge">{wifiMeshIp}</Text>
                </View>
              </View>
            )}

            {tailscaleIps.map((ip, index) => (
              <View style={styles.ipRow} key={ip}>
                <List.Icon icon="vpn" />
                <View style={{flex: 1}}>
                  <Text variant="labelMedium">
                    {t('Tailscale IP-adress')}
                    {tailscaleIps.length > 1 ? ` ${index + 1}` : ''}
                  </Text>
                  <Text variant="bodyLarge">{ip}</Text>
                </View>
              </View>
            ))}
          </View>
        </Surface>

        <Button
          mode="contained"
          icon="refresh"
          onPress={handleRefresh}
          style={styles.button}>
          {t('Uppdatera IP-adresser')}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
    margin: 16,
  },
  surface: {
    padding: 0,
  },
  ipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    alignSelf: 'center',
  },
  renewButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
});
