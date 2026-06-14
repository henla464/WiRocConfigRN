import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text, TextInput} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

import {useActiveWiRocDevice} from '@lib/hooks/useActiveWiRocDevice';
import {useNotify} from '@lib/hooks/useNotify';
import {useWiRocPropertyQuery} from '@lib/hooks/useWiRocPropertyQuery';
import {useStore} from '@store/index';

const configObj = require('../../../../../../../config/config.json');

export default function DeviceAccess() {
  const {t} = useTranslation();
  const deviceId = useActiveWiRocDevice();
  const notify = useNotify();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {data: deviceName} = useWiRocPropertyQuery(deviceId, 'wirocdevicename');
  const bleConnectionStatus = useStore(
    state => state.wiRocDevices[deviceId]?.bleConnection?.status,
  );
  const isConnected = bleConnectionStatus === 'connected';

  const grantAccess = async () => {
    if (!email || !password) {
      notify({
        type: 'error',
        message: t('Ange både e-postadress och lösenord'),
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        'https://monitor.wiroc.se/api/v1/DeviceAccess/grant',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Authorization': configObj.apiKey,
          },
          body: JSON.stringify({
            BTAddress: deviceId,
            UserEmail: email,
            UserPassword: password,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      notify({
        type: 'info',
        message: t('Åtkomst beviljad till {{device}} för {{user}}', {
          device: deviceName ?? deviceId,
          user: email,
        }),
      });
      setEmail('');
      setPassword('');
    } catch (err) {
      notify({
        type: 'error',
        message:
          t('Kunde inte bevilja åtkomst: ') +
          (err instanceof Error ? err.message : t('Okänt fel')),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.explanation}>
        {t(
          'Ange din email och lösenord till monitor.wiroc.se för att ge dig åtkomst att redigera denna enhet på monitor.wiroc.se',
        )}
      </Text>
      <TextInput
        mode="outlined"
        label={t('E-post')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        disabled={!isConnected || isLoading}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label={t('Lösenord')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        disabled={!isConnected || isLoading}
        style={styles.input}
      />
      <Button
        icon="account-key"
        mode="contained"
        loading={isLoading}
        disabled={!isConnected || isLoading}
        onPress={grantAccess}
        style={styles.button}>
        {t('Ge åtkomst till enhet')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingLeft: 16,
    paddingTop: 24,
    paddingRight: 16,
    paddingBottom: 0,
    backgroundColor: 'rgb(255, 251, 255)',
  },
  explanation: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    padding: 6,
  },
});
