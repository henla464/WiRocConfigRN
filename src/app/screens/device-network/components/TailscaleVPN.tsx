import React from 'react';
import {Linking, ScrollView, StyleSheet, View} from 'react-native';
import {
  Button,
  List,
  ProgressBar,
  Surface,
  Switch,
  Text,
  Snackbar,
} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import * as Clipboard from 'expo-clipboard';

import {
  useWiRocPropertyMutation,
  useWiRocPropertyQuery,
} from '@lib/hooks/useWiRocPropertyQuery';

interface TailscaleVPNProps {
  deviceId: string;
}

export default function TailscaleVPN({deviceId}: TailscaleVPNProps) {
  const {t} = useTranslation();

  const {
    data: isTailscaleEnabled,
    refetch: refetchEnabled,
    isLoading: isLoadingEnabled,
  } = useWiRocPropertyQuery(deviceId, 'network/tailscale/enabled', {
    defaultValue: false,
  });

  const {
    data: tailscaleLoginUrl,
    refetch: refetchLoginUrl,
    isFetching: isFetchingLogin,
  } = useWiRocPropertyQuery(deviceId, 'network/tailscale/login', {
    enabled: false,
  });

  const {
    data: tailscaleStatus,
    refetch: refetchStatus,
    isFetching: isFetchingStatus,
  } = useWiRocPropertyQuery(deviceId, 'network/tailscale/status', {
    enabled: false,
  });

  const {mutate: setTailscaleEnabled, isPending: isSettingEnabled} =
    useWiRocPropertyMutation(deviceId, 'network/tailscale/enabled', {
      onSettled: () => {
        refetchEnabled();
      },
    });

  const {mutate: triggerLogin, isPending: isLoggingIn} =
    useWiRocPropertyMutation(deviceId, 'network/tailscale/login');

  const [snackbarMessage, setSnackbarMessage] = React.useState('');

  const handleCopyLink = async () => {
    if (tailscaleLoginUrl) {
      await Clipboard.setStringAsync(tailscaleLoginUrl);
      setSnackbarMessage(t('Länk kopierad'));
    }
  };

  const handleOpenLink = () => {
    if (tailscaleLoginUrl) {
      Linking.openURL(tailscaleLoginUrl);
    }
  };

  const handleLogin = () => {
    triggerLogin(undefined as never);
    refetchLoginUrl();
  };

  const isLoading = isLoadingEnabled || isSettingEnabled;

  return (
    <ScrollView>
      <ProgressBar visible={isLoading} indeterminate />
      <View style={styles.container}>
        <Surface style={styles.infoSurface}>
          <View style={{padding: 16, gap: 8}}>
            <Text variant="titleSmall">{t('Om Tailscale VPN')}</Text>
            <Text variant="bodyMedium">
              {t('tailscale_info')}
            </Text>
          </View>
        </Surface>

        <Surface style={styles.surface}>
          <List.Item
            title={t('Tailscale VPN')}
            description={isTailscaleEnabled ? t('På') : t('Av')}
            disabled={typeof isTailscaleEnabled !== 'boolean'}
            style={{
              opacity:
                typeof isTailscaleEnabled === 'boolean' ? undefined : 0.5,
            }}
            left={props => <List.Icon {...props} icon="vpn" />}
            right={props => (
              <Switch
                {...props}
                value={isTailscaleEnabled}
                disabled={isSettingEnabled}
                onValueChange={() => {
                  setTailscaleEnabled(!isTailscaleEnabled);
                }}
              />
            )}
          />
        </Surface>

        {isTailscaleEnabled && (
          <Surface style={styles.surface}>
            <View style={{padding: 16, gap: 16}}>
              <Text variant="titleSmall">{t('Logga in på Tailscale')}</Text>

              <Button
                mode="contained"
                icon="login"
                onPress={handleLogin}
                loading={isLoggingIn || isFetchingLogin}
                disabled={isLoggingIn}>
                {isLoggingIn
                  ? t('Loggar in...')
                  : t('Logga in på Tailscale')}
              </Button>

              {tailscaleLoginUrl ? (
                <View style={{gap: 8}}>
                  <Text variant="labelMedium">{t('Inloggningslänk')}:</Text>
                  <Text
                    variant="bodyMedium"
                    style={{color: 'blue'}}
                    selectable>
                    {tailscaleLoginUrl}
                  </Text>
                  <View style={styles.buttonRow}>
                    <Button
                      mode="outlined"
                      icon="content-copy"
                      onPress={handleCopyLink}
                      style={{flex: 1}}>
                      {t('Kopiera länk')}
                    </Button>
                    <Button
                      mode="outlined"
                      icon="open-in-new"
                      onPress={handleOpenLink}
                      style={{flex: 1}}>
                      {t('Öppna i webbläsare')}
                    </Button>
                  </View>
                </View>
              ) : (
                <Text variant="bodyMedium" style={{opacity: 0.5}}>
                  {t('Ingen inloggningslänk tillgänglig')}
                </Text>
              )}
            </View>
          </Surface>
        )}

        {isTailscaleEnabled && (
          <Surface style={styles.surface}>
            <View style={{padding: 16, gap: 16}}>
              <Text variant="titleSmall">{t('Tailscale status')}</Text>

              <Button
                mode="contained"
                icon="refresh"
                onPress={() => refetchStatus()}
                loading={isFetchingStatus}>
                {t('Hämta status')}
              </Button>

              {tailscaleStatus ? (
                <Text
                  variant="bodyMedium"
                  style={{fontFamily: 'monospace'}}
                  selectable>
                  {tailscaleStatus}
                </Text>
              ) : null}
            </View>
          </Surface>
        )}
      </View>
      <Snackbar
        visible={snackbarMessage !== ''}
        onDismiss={() => setSnackbarMessage('')}
        duration={2000}>
        {snackbarMessage}
      </Snackbar>
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
  infoSurface: {
    padding: 0,
    backgroundColor: '#E3F2FD',
  },
  surface: {
    padding: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
});
