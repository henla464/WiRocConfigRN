import {useQuery, useQueryClient} from '@tanstack/react-query';
import React, {useEffect, useRef, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {
  Button,
  DataTable,
  Divider,
  Surface,
  TextInput,
  useTheme,
} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

import {TestPunch} from '@api/types';
import {useActiveWiRocDevice} from '@lib/hooks/useActiveWiRocDevice';
import {useNotify} from '@lib/hooks/useNotify';
import {useWiRocDeviceApi} from '@lib/hooks/useWiRocDeviceApi';
import {useWiRocPropertyQuery} from '@lib/hooks/useWiRocPropertyQuery';

export default function SendPunches() {
  const {t} = useTranslation();
  const deviceId = useActiveWiRocDevice();
  const queryClient = useQueryClient();
  const wiRocDeviceApi = useWiRocDeviceApi(deviceId);
  const [siCardNo, setSiCardNo] = useState<string>('16777215');
  const [numberOfPunchesInput, setNumberOfPunchesInput] = useState('1');
  const numberOfPunches = parseInt2(numberOfPunchesInput);
  const [sendIntervalInput, setSendIntervalInput] = useState('1');
  const sendInterval = parseFloat(sendIntervalInput);
  const [isSending, setIsSending] = useState(false);
  const [, setTick] = useState(0);
  const stateRef = useRef<TestPunch[]>();
  const sirapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sirapSentTimestamps = useRef<Record<string, number>>({});
  const notify = useNotify();

  const {data: punches = []} = useQuery<unknown, unknown, TestPunch[]>({
    queryKey: [deviceId, 'testPunches'],
    queryFn: async () => {
      // The device will stream punches to us.
      // Managed inside useReactQuerySubscription.
      return [];
    },
    staleTime: Infinity,
  });

  // make stateRef always have the current punches
  stateRef.current = punches;

  const {data: ackReq} = useWiRocPropertyQuery(
    deviceId,
    'acknowledgementrequested',
  );

  useEffect(() => {
    let completedPunches = punches.filter(punch => {
      if (punch.Type !== 'TestPunch') {
        return false;
      }
      if (punch.TypeName === 'SIRAP') {
        // SIRAP: no ACK, "Sent" or "Failed" means done
        if (punch.Status === 'Sent') {
          if (!(punch.Id in sirapSentTimestamps.current)) {
            sirapSentTimestamps.current[punch.Id] = Date.now();
          }
          return true;
        }
        if (punch.Status === 'Failed') {
          // Failed is immediate, no settle period
          sirapSentTimestamps.current[punch.Id] = 0;
          if (punch.NoOfSendTries >= punch.MaxTries) {
            return true;
          }
        }
        return false;
      }
      // LORA: acked, not-acked, failed-after-tries, or explicit Failed
      return (
        (punch.Status === 'Acked' && ackReq) ||
        (punch.Status === 'Not acked' && !ackReq) ||
        punch.Status === 'Failed' ||
        (punch.NoOfSendTries > 1 &&
          (punch.Status === 'Not sent' || punch.Status === 'Not acked'))
      );
    });

    let testPunches = punches.filter(punch => {
      return punch.Type === 'TestPunch';
    });
    // Use TestPunchId: same punch appears for both LORA and SIRAP, count once
    const uniqueTestPunchIds = new Set(testPunches.map(p => p.TestPunchId))
      .size;
    let noOfCompletedRows = completedPunches.length;

    if (
      uniqueTestPunchIds === numberOfPunches &&
      testPunches.length === noOfCompletedRows
    ) {
      // Find remaining time for the most recent unsettled SIRAP Sent
      const sirapRemaining = Math.max(
        0,
        ...completedPunches
          .filter(p => p.TypeName === 'SIRAP' && p.Status === 'Sent')
          .map(p => {
            const ts = sirapSentTimestamps.current[p.Id] ?? 0;
            return 2000 - (Date.now() - ts);
          }),
      );

      if (sirapRemaining > 0) {
        // SIRAP Sent: wait for settle period to pass before stopping
        if (sirapTimeoutRef.current) {
          clearTimeout(sirapTimeoutRef.current);
        }
        sirapTimeoutRef.current = setTimeout(() => {
          wiRocDeviceApi.stopWatchingTestPunches();
          setIsSending(false);
        }, sirapRemaining);
      } else {
        // LORA: stop immediately
        wiRocDeviceApi.stopWatchingTestPunches();
        setIsSending(false);
      }
    }
  }, [punches, ackReq, numberOfPunches, deviceId, wiRocDeviceApi]);

  const startStopSendPunches = async () => {
    if (isSending) {
      setIsSending(false);
      if (sirapTimeoutRef.current) {
        clearTimeout(sirapTimeoutRef.current);
        sirapTimeoutRef.current = null;
      }
      wiRocDeviceApi.stopWatchingTestPunches();
    } else {
      setIsSending(true);
      if (!siCardNo || siCardNo.length === 0 || isNaN(parseInt(siCardNo, 10))) {
        notify({
          message: t('SI Nummer måste fyllas i'),
          type: 'info',
        });
        return;
      }

      if (isNaN(numberOfPunches)) {
        notify({
          message: t('Ogiltigt antal'),
          type: 'info',
        });
        return;
      }

      if (isNaN(sendInterval)) {
        notify({
          message: t('Ogiltigt intervall'),
          type: 'info',
        });
        return;
      }

      queryClient.setQueryData([deviceId, 'testPunches'], []);
      sirapSentTimestamps.current = {};
      wiRocDeviceApi.startWatchingTestPunches();
      wiRocDeviceApi.startSendingTestPunches({
        numberOfPunches,
        sendInterval: sendInterval * 1000,
        siCardNo,
      });
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'Acked':
        return t('Bekr.');
      case 'Not acked':
        return t('Ej bekr.');
      case 'Failed':
        return t('Misslyckad');
      case 'Sent':
        return t('Skickad');
      case 'Not added':
        return t('Ej till.');
      case 'Added':
        return t('Tillagd');
      default:
        return status;
    }
  };

  const isSettledSirap = (punch: TestPunch) => {
    if (punch.TypeName !== 'SIRAP') {
      return false;
    }
    if (punch.Status === 'Failed' && punch.NoOfSendTries >= punch.MaxTries) {
      return true;
    }
    if (punch.Status === 'Sent') {
      return true;
    }
    return false;
  };

  const getTypeSymbol = (typeName: string) => {
    switch (typeName) {
      case 'LORA':
        return '🛜';
      case 'SIRAP':
        return '🔗';
      default:
        return typeName;
    }
  };

  const getStatusStyle = (punch: TestPunch) => {
    if (punch.Type === 'Punch') {
      return styles.punchBackgroundColor;
    } else {
      if (punch.TypeName === 'SIRAP') {
        if (
          punch.Status === 'Failed' &&
          punch.NoOfSendTries >= punch.MaxTries
        ) {
          return styles.failure;
        }
        if (punch.Status === 'Sent') {
          return styles.success;
        }
        return styles.centered;
      } else {
        if (punch.Status === 'Failed') {
          return styles.failure;
        }
      }
      if (!ackReq) {
        return styles.centered;
      }
      if (punch.Status === 'Acked') {
        return styles.success;
      }
      if (punch.Status === 'Not acked') {
        return styles.failure;
      }
      return styles.centered;
    }
  };

  // Tick every second while waiting for 2s SIRAP settle period to pass
  useEffect(() => {
    if (!isSending) {
      return;
    }
    const hasPending = punches.some(
      p =>
        p.TypeName === 'SIRAP' &&
        p.Status === 'Sent' &&
        sirapSentTimestamps.current[p.Id] !== undefined &&
        Date.now() - sirapSentTimestamps.current[p.Id] < 2000,
    );
    if (!hasPending) {
      return;
    }
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [punches, isSending]);

  const {colors} = useTheme();
  return (
    <View
      style={{
        padding: 16,
        gap: 16,
        flex: 1,
        backgroundColor: colors.background,
      }}>
      <Surface
        style={{
          padding: 16,
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 12,
        }}>
        <TextInput
          disabled={isSending}
          value={siCardNo}
          label={t('SI-nummer')}
          onChangeText={text => {
            if (text === '') {
              setSiCardNo('');
            }
            const siNumberParsed = parseInt(text, 10);
            if (!isNaN(siNumberParsed)) {
              setSiCardNo(siNumberParsed.toString());
            }
          }}
          mode="outlined"
          keyboardType="number-pad"
          style={{width: '100%'}}
        />
        <TextInput
          disabled={isSending}
          value={numberOfPunchesInput}
          label={t('Antal')}
          error={isNaN(numberOfPunches)}
          selectTextOnFocus
          onChangeText={setNumberOfPunchesInput}
          mode="outlined"
          keyboardType="number-pad"
          style={{flex: 1}}
        />
        <TextInput
          disabled={isSending}
          value={sendIntervalInput}
          label={t('Intervall')}
          right={<TextInput.Affix text="s" />}
          error={isNaN(sendInterval)}
          selectTextOnFocus
          onChangeText={setSendIntervalInput}
          mode="outlined"
          keyboardType="number-pad"
          style={{flex: 1}}
        />
        <Button
          hitSlop={{top: 10, bottom: 10}}
          icon="send"
          loading={isSending}
          mode="contained"
          buttonColor={isSending ? 'red' : 'green'}
          color="secondary"
          onPress={startStopSendPunches}
          labelStyle={{fontSize: 16}}
          style={{flex: 1}}>
          {isSending ? t('Sluta skicka') : t('Skicka')}
        </Button>
      </Surface>
      <Surface style={{flex: 1}}>
        <DataTable style={styles.table}>
          <DataTable.Header style={styles.row}>
            <DataTable.Title
              textStyle={{fontSize: 20}}
              style={[{flex: 5}, styles.centered]}>
              {' '}
            </DataTable.Title>
            <DataTable.Title
              textStyle={{fontSize: 20}}
              style={{flex: 8, justifyContent: 'center'}}>
              {t('Tid')}
            </DataTable.Title>
            <DataTable.Title
              textStyle={{fontSize: 20}}
              style={[styles.centered, {flex: 8}]}>
              {t('RSSI')}
            </DataTable.Title>
            <DataTable.Title
              textStyle={{fontSize: 20}}
              style={[styles.centered, {flex: 7}]}>
              {t('Förs.')}
            </DataTable.Title>
            <DataTable.Title
              textStyle={{fontSize: 20}}
              style={[styles.centered, {flex: 10}]}>
              {t('Status')}
            </DataTable.Title>
          </DataTable.Header>
          <Divider bold={true} />
          <ScrollView contentContainerStyle={{flexGrow: 1}} style={{}}>
            {punches.map((punch, idx) => (
              <DataTable.Row key={punch.Id} style={styles.row}>
                <DataTable.Cell
                  textStyle={{fontSize: 20}}
                  style={[
                    {flex: 5},
                    styles.centered,
                    punch.Type === 'Punch'
                      ? styles.punchBackgroundColor
                      : styles.testPunchBackgroundColor,
                  ]}>
                  {getTypeSymbol(punch.TypeName)}
                </DataTable.Cell>
                <DataTable.Cell
                  textStyle={{fontSize: 20}}
                  style={[
                    punch.Type === 'Punch'
                      ? styles.punchBackgroundColor
                      : styles.testPunchBackgroundColor,
                    styles.centered,
                    {flex: 8},
                  ]}>
                  {punch.Time}
                </DataTable.Cell>
                <DataTable.Cell
                  textStyle={{fontSize: 22}}
                  style={[
                    {flex: 8, justifyContent: 'center'},
                    punch.Type === 'Punch'
                      ? styles.punchBackgroundColor
                      : styles.testPunchBackgroundColor,
                  ]}>
                  {punch.RSSI}
                </DataTable.Cell>
                <DataTable.Cell
                  textStyle={{fontSize: 22}}
                  style={[
                    {flex: 7},
                    punch.Type === 'Punch'
                      ? [styles.punchBackgroundColor, styles.centered]
                      : isSettledSirap(punch)
                        ? punch.NoOfSendTries > 1 || punch.Status === 'Failed'
                          ? styles.failure
                          : styles.success
                        : punch.Status === 'Failed'
                          ? styles.failure
                          : punch.NoOfSendTries > 1
                            ? styles.failure
                            : punch.Status === 'Acked'
                              ? styles.success
                              : styles.centered,
                  ]}>
                  {punch.NoOfSendTries}
                </DataTable.Cell>
                <DataTable.Cell
                  textStyle={{fontSize: 20}}
                  style={[{flex: 10}, getStatusStyle(punch)]}>
                  {getStatusDisplayName(punch.Status)}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </ScrollView>
          <Divider bold={true} />
          <DataTable.Row key={'footer'} style={styles.row}>
            <DataTable.Cell textStyle={{fontSize: 22}} style={{flex: 21}}>
              {t('Procent lyckade')}
            </DataTable.Cell>
            <DataTable.Cell
              textStyle={{fontSize: 22}}
              style={{flex: 7, justifyContent: 'center'}}>
              {formatPercentage(
                punches.filter(
                  p =>
                    p.Status === 'Acked' ||
                    (p.TypeName === 'SIRAP' && p.Status === 'Sent'),
                ).length /
                  punches
                    .filter(punch => {
                      return punch.Status !== 'Punch';
                    })
                    .map(p => p.NoOfSendTries)
                    .reduce((a, b) => a + b, 0),
              )}
            </DataTable.Cell>
            <DataTable.Cell
              textStyle={{fontSize: 22}}
              style={{flex: 10, justifyContent: 'center'}}>
              {formatPercentage(
                punches.filter(
                  p =>
                    p.Status === 'Acked' ||
                    (p.TypeName === 'SIRAP' && p.Status === 'Sent'),
                ).length /
                  punches.filter(punch => {
                    return punch.Status !== 'Punch';
                  }).length,
              )}
            </DataTable.Cell>
          </DataTable.Row>
        </DataTable>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    paddingRight: 0,
    marginRight: 0,
    flex: 1,
  },
  row: {
    paddingRight: 0,
    paddingLeft: 5,
  },
  success: {
    backgroundColor: 'palegreen',
    justifyContent: 'center',
  },
  failure: {
    backgroundColor: 'salmon',
    justifyContent: 'center',
  },
  centered: {
    justifyContent: 'center',
  },
  punchBackgroundColor: {
    backgroundColor: 'lightgray',
  },
  testPunchBackgroundColor: {},
});

function parseInt2(value: string) {
  if (!/^\d+$/.test(value)) {
    return NaN;
  }
  return parseInt(value, 10);
}

function formatPercentage(value: number) {
  if (isNaN(value)) {
    return '-';
  }
  return `${Math.round(value * 100)}%`;
}
