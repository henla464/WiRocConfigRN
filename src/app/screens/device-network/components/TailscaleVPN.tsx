import React, {useEffect, useRef} from 'react';
import {Linking, ScrollView, StyleSheet, View} from 'react-native';
import {
  Button,
  Icon,
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

interface TailscaleStatus {
  Version?: string;
  TUN?: boolean;
  BackendState?: string;
  TailscaleIPs?: string[];
  Self?: {
    ID?: string;
    HostName?: string;
    Online?: boolean;
    TailscaleIPs?: string[];
    UserID?: number;
  };
}

interface TailscalePrefs {
  RouteAll?: boolean;
  LoggedOut?: boolean;
  AdvertiseRoutes?: string[] | null;
}

function parseJson<T>(raw: string): T {
  try {
    return JSON.parse(raw);
  } catch {
    return {} as T;
  }
}

const POLL_INTERVAL = 3000;
const POLL_TIMEOUT = 120000; // 2 minutes

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
    data: tailscaleStatusRaw,
    refetch: refetchStatus,
    isFetching: isFetchingStatus,
  } = useWiRocPropertyQuery(deviceId, 'network/tailscale/status', {
    enabled: false,
  });

  const {
    data: tailscalePrefsRaw,
    refetch: refetchPrefs,
  } = useWiRocPropertyQuery(deviceId, 'network/tailscale/prefs', {
    enabled: false,
  });

  const tailscaleStatus = parseJson<TailscaleStatus>(tailscaleStatusRaw ?? '');
  const tailscalePrefs = parseJson<TailscalePrefs>(tailscalePrefsRaw ?? '');

  const {mutate: setTailscaleEnabled, isPending: isSettingEnabled} =
    useWiRocPropertyMutation(deviceId, 'network/tailscale/enabled', {
      onSettled: () => {
        refetchEnabled();
      },
    });

  const {mutate: triggerLogin, isPending: isLoggingIn} =
    useWiRocPropertyMutation(deviceId, 'network/tailscale/login', {
      onSettled: () => {
        refetchLoginUrl();
      },
    });

  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [isPolling, setIsPolling] = React.useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef = useRef<number>(0);

  const backendState = tailscaleStatus.BackendState;
  const isRunning = backendState === 'Running';
  const self = tailscaleStatus.Self;
  const isOnline = self?.Online ?? false;
  const isLoggedIn = isRunning && isOnline && (self?.UserID != null);

  // Advertised routes from prefs
  const advertisedRoutes = tailscalePrefs.AdvertiseRoutes ?? [];
  const hasAdvertisedRoutes = advertisedRoutes.length > 0;

  // Accepting routes: prefs RouteAll or LoggedOut=false (implies connected)
  const isAcceptingRoutes = tailscalePrefs.RouteAll === true;

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  // When login completes, stop polling
  useEffect(() => {
    if (isLoggedIn && isPolling) {
      stopPolling();
    }
  }, [isLoggedIn, isPolling]);

  const startPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }
    setIsPolling(true);
    pollStartRef.current = Date.now();
    refetchStatus();
    refetchPrefs();
    pollTimerRef.current = setInterval(() => {
      refetchStatus();
      refetchPrefs();
      if (Date.now() - pollStartRef.current >= POLL_TIMEOUT) {
        stopPolling();
      }
    }, POLL_INTERVAL);
  };

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setIsPolling(false);
  };

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
  };

  // After login mutation settles and URL is refetched, decide what to do
  useEffect(() => {
    if (isLoggingIn || isFetchingLogin) return;
    if (tailscaleLoginUrl === undefined) return; // hasn't been fetched yet

    if (tailscaleLoginUrl) {
      // Got a URL: show it and start polling
      startPolling();
    } else {
      // Empty URL: may already be logged in — check status now
      refetchStatus();
      refetchPrefs();
    }
  }, [isLoggingIn, isFetchingLogin, tailscaleLoginUrl]);

  const isLoading = isLoadingEnabled || isSettingEnabled;

  return (
    <ScrollView>
      <ProgressBar visible={isLoading} indeterminate />
      <View style={styles.container}>
        <Surface style={styles.infoSurface}>
          <View style={{padding: 16, gap: 8}}>
            <Text variant="titleSmall">{t('Om Tailscale VPN')}</Text>
            <Text variant="bodyMedium">{t('tailscale_info')}</Text>
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
                  stopPolling();
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

              {isLoggedIn && (
                <View style={styles.loggedInBanner}>
                  <Icon source="check-circle" size={20} color="#2E7D32" />
                  <Text variant="bodyMedium" style={{color: '#2E7D32'}}>
                    {t('Inloggad')}
                  </Text>
                </View>
              )}

              <Button
                mode="contained"
                icon="login"
                onPress={handleLogin}
                loading={isLoggingIn || isPolling}
                disabled={isLoggingIn}>
                {isPolling
                  ? t('Väntar på inloggning...')
                  : isLoggingIn
                    ? t('Loggar in...')
                    : t('Logga in på Tailscale')}
              </Button>

              {tailscaleLoginUrl && !isLoggedIn ? (
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
              ) : null}

              {isPolling && !isLoggedIn && (
                <View style={styles.pollingIndicator}>
                  <ProgressBar indeterminate style={{flex: 1}} />
                  <Text variant="bodySmall">
                    {Math.round(
                      Math.max(0, POLL_TIMEOUT - (Date.now() - pollStartRef.current)) / 1000,
                    )}s
                  </Text>
                </View>
              )}
            </View>
          </Surface>
        )}

        {isTailscaleEnabled && (
          <Surface style={styles.surface}>
            <View style={{padding: 16, gap: 16}}>
              <Text variant="titleSmall">{t('Tailscale status')}</Text>

              <View style={styles.statusList}>
                <View style={styles.statusRow}>
                  <Icon
                    source={isRunning ? 'check-circle' : 'close-circle'}
                    size={20}
                    color={isRunning ? '#2E7D32' : '#B71C1C'}
                  />
                  <Text variant="bodyMedium">{t('Tailscale körs')}</Text>
                </View>

                <View style={styles.statusRow}>
                  <Icon
                    source={isLoggedIn ? 'check-circle' : 'close-circle'}
                    size={20}
                    color={isLoggedIn ? '#2E7D32' : '#B71C1C'}
                  />
                  <Text variant="bodyMedium">{t('Inloggad')}</Text>
                </View>

                <View style={styles.statusRow}>
                  <Icon
                    source={isAcceptingRoutes ? 'check-circle' : 'close-circle'}
                    size={20}
                    color={isAcceptingRoutes ? '#2E7D32' : '#B71C1C'}
                  />
                  <Text variant="bodyMedium">{t('Accepterar routes')}</Text>
                </View>

                <View style={styles.statusRow}>
                  <Icon
                    source={hasAdvertisedRoutes ? 'check-circle' : 'close-circle'}
                    size={20}
                    color={hasAdvertisedRoutes ? '#2E7D32' : '#B71C1C'}
                  />
                  <Text variant="bodyMedium">
                    {t('Annonserar routes')}
                    {hasAdvertisedRoutes && (
                      <Text variant="bodySmall">
                        {' '}
                        ({advertisedRoutes.join(', ')})
                      </Text>
                    )}
                  </Text>
                </View>
                {hasAdvertisedRoutes && (
                  <Text variant="bodySmall" style={{color: '#757575', paddingLeft: 30}}>
                    {t('tailscale_approve_routes_note')}
                  </Text>
                )}
              </View>

              <Button
                mode="contained"
                icon="refresh"
                onPress={() => {
                  refetchStatus();
                  refetchPrefs();
                }}
                loading={isFetchingStatus}>
                {t('Hämta status')}
              </Button>

              {tailscaleStatusRaw ? (
                <View style={styles.rawStatus}>
                  <Text variant="labelMedium" style={{marginBottom: 4}}>
                    {t('Status')}:
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{fontFamily: 'monospace'}}
                    selectable>
                    {tailscaleStatusRaw}
                  </Text>
                </View>
              ) : null}

              {tailscalePrefsRaw ? (
                <View style={styles.rawStatus}>
                  <Text variant="labelMedium" style={{marginBottom: 4}}>
                    {t('Inställningar')}:
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{fontFamily: 'monospace'}}
                    selectable>
                    {tailscalePrefsRaw}
                  </Text>
                </View>
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
  loggedInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  pollingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusList: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rawStatus: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
});
