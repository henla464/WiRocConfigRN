import React, {useCallback, useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {useTranslation} from 'react-i18next';
import {Button, List, Switch, TextInput} from 'react-native-paper';

import {SettablePropName, SettableValues, getters} from '@api/transformers';
import {ListItemMenu, ListItemMenuItem} from '@lib/components/ListItemMenu';
import SaveBanner from '@lib/components/SaveBanner';
import {useActiveWiRocDevice} from '@lib/hooks/useActiveWiRocDevice';
import {useConfigurationProperty} from '@lib/hooks/useConfigurationProperty';
import {useWiRocDeviceApi} from '@lib/hooks/useWiRocDeviceApi';
import {useWiRocPropertiesMutation} from '@lib/hooks/useWiRocPropertyQuery';

const toInt = (text: string) => {
  const parsed = parseInt(text, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export default function SRRTestMode() {
  const {t} = useTranslation();
  const deviceId = useActiveWiRocDevice();
  const [defaultValues, setDefaultValues] = useState<Partial<SettableValues>>(
    {},
  );

  const onDefaultValuesChange = useCallback((data: Partial<SettableValues>) => {
    setDefaultValues(prevState => ({
      ...prevState,
      ...data,
    }));
  }, []);

  const form = useForm<SettableValues>({
    defaultValues: {},
    mode: 'onChange',
  });

  const [
    {
      field: {value: testModeEnabled, onChange: setTestModeEnabled},
    },
  ] = useConfigurationProperty(
    deviceId,
    'srr/testmodeenabled',
    onDefaultValuesChange,
    {control: form.control},
  );

  const [
    {
      field: {value: testMode, onChange: setTestMode},
    },
  ] = useConfigurationProperty(
    deviceId,
    'srr/testmode',
    onDefaultValuesChange,
    {control: form.control},
  );

  const [
    {
      field: {value: testMode3InitialDelay, onChange: setTestMode3InitialDelay},
    },
  ] = useConfigurationProperty(
    deviceId,
    'srr/testmode3initialdelay',
    onDefaultValuesChange,
    {control: form.control},
  );

  const [
    {
      field: {value: testMode3Delay, onChange: setTestMode3Delay},
    },
  ] = useConfigurationProperty(
    deviceId,
    'srr/testmode3delay',
    onDefaultValuesChange,
    {control: form.control},
  );

  const [
    {
      field: {value: testMode3PunchCount, onChange: setTestMode3PunchCount},
    },
  ] = useConfigurationProperty(
    deviceId,
    'srr/testmode3punchcount',
    onDefaultValuesChange,
    {control: form.control},
  );

  const [messagesSent, setMessagesSent] = useState<number>();
  const [messagesAcked, setMessagesAcked] = useState<number>();
  const [outgoingQueueCount, setOutgoingQueueCount] = useState<number>();
  const [isFetchingStats, setIsFetchingStats] = useState(false);

  const api = useWiRocDeviceApi(deviceId);

  const [mTop, setMTop] = useState(0);
  const {reset, formState, handleSubmit} = form;

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const {mutate} = useWiRocPropertiesMutation(deviceId);

  const onSubmit = (data: SettableValues) => {
    const changedData = Object.fromEntries(
      Object.entries(data).filter(([key]) => {
        return formState.dirtyFields[key as SettablePropName];
      }),
    );
    mutate(changedData);
    reset(undefined, {
      keepValues: true,
    });
  };

  const getStat = async (
    property:
      | 'srr/messagessent'
      | 'srr/messagesacked'
      | 'srr/outgoingqueuecount',
  ) => {
    const value = await Promise.race([
      api.getProperty(property),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000),
      ),
    ]);
    return getters[property].deserialize(value);
  };

  const onFetchStats = async () => {
    setIsFetchingStats(true);
    try {
      const [sent, acked, queueCount] = await Promise.allSettled([
        getStat('srr/messagessent'),
        getStat('srr/messagesacked'),
        getStat('srr/outgoingqueuecount'),
      ]);
      if (sent.status === 'fulfilled') {
        setMessagesSent(sent.value);
      }
      if (acked.status === 'fulfilled') {
        setMessagesAcked(acked.value);
      }
      if (queueCount.status === 'fulfilled') {
        setOutgoingQueueCount(queueCount.value);
      }
    } finally {
      setIsFetchingStats(false);
    }
  };

  const enabled = testModeEnabled === true;

  const testModeOptions = [
    {
      value: 1,
      label: t('TX bärvåg (omodulerad)'),
      icon: 'sine-wave',
    },
    {
      value: 2,
      label: t('TX 0xAA-loop'),
      icon: 'repeat',
    },
    {
      value: 3,
      label: t('TX normala stämplingar'),
      icon: 'clock-outline',
    },
  ];

  const selectedModeOption = testModeOptions.find(
    option => option.value === testMode,
  );

  const messagesSentCount = messagesSent ?? 0;
  const messagesAckedCount = messagesAcked ?? 0;
  const successPercent =
    messagesSentCount > 0
      ? (messagesAckedCount / messagesSentCount) * 100
      : undefined;
  const failurePercent =
    successPercent !== undefined ? 100 - successPercent : undefined;

  return (
    <View style={styles.container}>
      <SaveBanner
        visible={formState.isDirty}
        isSaveDisabled={!formState.isValid}
        errors={formState.errors}
        save={handleSubmit(onSubmit)}
        reload={() => reset()}
        onHideAnimationFinished={() => {
          setTimeout(() => setMTop(0), 0);
        }}
        onShowAnimationFinished={() => {
          setTimeout(() => setMTop(133), 0);
        }}
      />
      <ScrollView
        style={{flex: 1, marginTop: mTop}}
        contentContainerStyle={{width: '100%', paddingBottom: 16}}>
        <View style={{width: '100%'}}>
          <List.Item
            title={t('Aktivera testläge')}
            description={enabled ? t('På') : t('Av')}
            left={props => <List.Icon {...props} icon="test-tube" />}
            right={props => (
              <Switch
                {...props}
                value={enabled}
                onValueChange={value => {
                  setTestModeEnabled(value);
                  if (value && (testMode ?? 0) < 1) {
                    setTestMode(1);
                  }
                }}
              />
            )}
          />
          <ListItemMenu
            disabled={!enabled}
            title={t('Testläge')}
            description={selectedModeOption?.label}
            icon="format-list-numbered">
            {testModeOptions.map(option => (
              <ListItemMenuItem
                key={option.value}
                title={option.label}
                leadingIcon={option.icon}
                onPress={() => {
                  setTestMode(option.value);
                }}
              />
            ))}
          </ListItemMenu>
          {testMode === 3 && (
            <View style={styles.testMode3Container}>
              <TextInput
                value={
                  testMode3InitialDelay !== undefined
                    ? String(testMode3InitialDelay)
                    : ''
                }
                onChangeText={text => setTestMode3InitialDelay(toInt(text))}
                label={t('Initial fördröjning (sekunder)')}
                keyboardType="number-pad"
                style={styles.textInput}
              />
              <TextInput
                value={
                  testMode3Delay !== undefined ? String(testMode3Delay) : ''
                }
                onChangeText={text => setTestMode3Delay(toInt(text))}
                label={t('Fördröjning mellan meddelanden (tiondels sekunder)')}
                keyboardType="number-pad"
                style={styles.textInput}
              />
              <TextInput
                value={
                  testMode3PunchCount !== undefined
                    ? String(testMode3PunchCount)
                    : ''
                }
                onChangeText={text => setTestMode3PunchCount(toInt(text))}
                label={t('Antal stämplingar (0 = obegränsat)')}
                keyboardType="number-pad"
                style={styles.textInput}
              />
            </View>
          )}
          <Button
            mode="contained"
            icon="refresh"
            loading={isFetchingStats}
            disabled={isFetchingStats}
            onPress={onFetchStats}
            style={styles.button}>
            {t('Hämta statistik')}
          </Button>
          <List.Item
            title={t('Meddelanden skickade')}
            description={
              messagesSent !== undefined ? String(messagesSent) : '-'
            }
            left={props => <List.Icon {...props} icon="send" />}
            style={styles.statItem}
          />
          <List.Item
            title={t('Meddelanden ackade')}
            description={
              messagesAcked !== undefined ? String(messagesAcked) : '-'
            }
            left={props => <List.Icon {...props} icon="check-circle-outline" />}
            style={styles.statItem}
          />
          <List.Item
            title={t('Andel lyckade')}
            description={
              successPercent !== undefined
                ? `${successPercent.toFixed(2)}%`
                : '-'
            }
            left={props => <List.Icon {...props} icon="percent" />}
            style={styles.statItem}
          />
          <List.Item
            title={t('Andel misslyckade')}
            description={
              failurePercent !== undefined
                ? `${failurePercent.toFixed(2)}%`
                : '-'
            }
            left={props => <List.Icon {...props} icon="percent-outline" />}
            style={styles.statItem}
          />
          <List.Item
            title={t('Antal i utgående kö')}
            description={
              outgoingQueueCount !== undefined
                ? String(outgoingQueueCount)
                : '-'
            }
            left={props => <List.Icon {...props} icon="playlist-play" />}
            style={styles.statItem}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingLeft: 5,
    paddingTop: 16,
    paddingRight: 5,
    paddingBottom: 0,
    backgroundColor: 'rgb(255, 251, 255)',
  },
  testMode3Container: {
    paddingLeft: 16,
    paddingRight: 16,
    gap: 8,
  },
  textInput: {
    backgroundColor: 'rgb(255, 251, 255)',
  },
  statItem: {
    paddingVertical: 0,
  },
  button: {
    margin: 10,
    marginLeft: 16,
    marginRight: 16,
  },
});
