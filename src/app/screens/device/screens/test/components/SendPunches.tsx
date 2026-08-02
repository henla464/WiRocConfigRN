import {useQuery, useQueryClient} from '@tanstack/react-query';
import React, {useEffect, useRef, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {
  Button,
  DataTable,
  Divider,
  Icon,
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
  const stateRef = useRef<TestPunch[]>(null);
  const settleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const settleTimestamps = useRef<Record<string, number>>({});
  const isTcpStyleOutput = (typeName: string) =>
    typeName === 'SIRAP' ||
    typeName === 'ROC' ||
    typeName === 'SERIAL' ||
    typeName === 'RS232' ||
    typeName === 'BLENO';
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
    'lora/acknowledgementrequested',
  );

  const {data: loraModule} = useWiRocPropertyQuery(deviceId, 'lora/module');
  const isRak3172 = loraModule === 'RAK3172';

  useEffect(() => {
    let completedPunches = punches.filter(punch => {
      if (punch.Type !== 'TestPunch') {
        return false;
      }
      if (isTcpStyleOutput(punch.TypeName)) {
        // TCP-style (SIRAP/ROC/etc): no ACK, "Sent" or "Failed" means done
        if (punch.Status === 'Sent') {
          if (!(punch.Id in settleTimestamps.current)) {
            settleTimestamps.current[punch.Id] = Date.now();
          }
          return true;
        }
        if (punch.Status === 'Failed') {
          // Failed is immediate, no settle period
          settleTimestamps.current[punch.Id] = 0;
          if (punch.NoOfSendTries >= punch.MaxTries) {
            return true;
          }
        }
        return false;
      }
      // Radio-style (LORA/SRR): acked, not-acked, failed-after-tries, or explicit Failed
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
    // Use TestPunchId: same punch appears for multiple output types, count once
    const uniqueTestPunchIds = new Set(testPunches.map(p => p.TestPunchId))
      .size;
    let noOfCompletedRows = completedPunches.length;

    if (
      uniqueTestPunchIds === numberOfPunches &&
      testPunches.length === noOfCompletedRows
    ) {
      // Find remaining time for the most recent unsettled TCP-style Sent
      const settleRemaining = Math.max(
        0,
        ...completedPunches
          .filter(p => isTcpStyleOutput(p.TypeName) && p.Status === 'Sent')
          .map(p => {
            const ts = settleTimestamps.current[p.Id] ?? 0;
            return 2000 - (Date.now() - ts);
          }),
      );

      if (settleRemaining > 0) {
        // TCP-style Sent: wait for settle period to pass before stopping
        if (settleTimeoutRef.current) {
          clearTimeout(settleTimeoutRef.current);
        }
        settleTimeoutRef.current = setTimeout(() => {
          wiRocDeviceApi.stopWatchingTestPunches();
          setIsSending(false);
        }, settleRemaining);
      } else {
        // Radio-style: stop immediately
        wiRocDeviceApi.stopWatchingTestPunches();
        setIsSending(false);
      }
    }
  }, [punches, ackReq, numberOfPunches, deviceId, wiRocDeviceApi]);

  const startStopSendPunches = async () => {
    if (isSending) {
      setIsSending(false);
      if (settleTimeoutRef.current) {
        clearTimeout(settleTimeoutRef.current);
        settleTimeoutRef.current = null;
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
      settleTimestamps.current = {};
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

  const isSettled = (punch: TestPunch) => {
    if (!isTcpStyleOutput(punch.TypeName)) {
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

  const getTypeIcon = (typeName: string) => {
    switch (typeName) {
      case 'LORA':
        return 'radio-tower';
      case 'SIRAP':
        return 'ethernet';
      case 'ROC':
        return 'cloud-upload-outline';
      case 'SRR':
        return 'radio-handheld';
      case 'SERIAL':
        return 'connection';
      case 'BLENO':
        return 'bluetooth';
      default:
        return 'help-circle-outline';
    }
  };

  const getTypeColor = (typeName: string) => {
    switch (typeName) {
      case 'LORA':
        return '#1976D2';
      case 'SIRAP':
        return '#7B1FA2';
      case 'ROC':
        return '#E65100';
      case 'SRR':
        return '#2E7D32';
      case 'SERIAL':
      case 'RS232':
        return '#00838F';
      case 'BLENO':
        return '#1565C0';
      default:
        return '#757575';
    }
  };

  const getStatusStyle = (punch: TestPunch) => {
    if (punch.Type === 'Punch') {
      return styles.punchBackgroundColor;
    } else {
      if (isTcpStyleOutput(punch.TypeName)) {
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

  // Tick every second while waiting for 2s TCP-style settle period to pass
  useEffect(() => {
    if (!isSending) {
      return;
    }
    const hasPending = punches.some(
      p =>
        isTcpStyleOutput(p.TypeName) &&
        p.Status === 'Sent' &&
        settleTimestamps.current[p.Id] !== undefined &&
        Date.now() - settleTimestamps.current[p.Id] < 2000,
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
        padding: 8,
        gap: 8,
        flex: 1,
        backgroundColor: colors.background,
      }}>
      <Surface
        style={{
          padding: 8,
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
              style={styles.symbolCol}>
              {' '}
            </DataTable.Title>
            <DataTable.Title
              textStyle={{fontSize: 20}}
              style={{flex: 1.5, justifyContent: 'center'}}>
              {t('Tid')}
            </DataTable.Title>
            <DataTable.Title
              textStyle={{fontSize: 20}}
              style={[{width: 50}, styles.centered]}>
              {t('RSSI')}
            </DataTable.Title>
            {isRak3172 && (
              <DataTable.Title
                textStyle={{fontSize: 20}}
                style={[{width: 40}, styles.centered]}>
                {'SNR'}
              </DataTable.Title>
            )}
            <DataTable.Title
              textStyle={{fontSize: 20}}
              style={[{width: 45}, styles.centered]}>
              {t('Förs.')}
            </DataTable.Title>
            <DataTable.Title
              textStyle={{fontSize: 20}}
              style={{flex: 1.5, justifyContent: 'center'}}>
              {t('Status')}
            </DataTable.Title>
          </DataTable.Header>
          <Divider bold={true} />
          <ScrollView contentContainerStyle={{flexGrow: 1}} style={{}}>
            {punches.map((punch, idx) => (
              <DataTable.Row key={punch.Id} style={styles.row}>
                <DataTable.Cell
                  style={[
                    styles.symbolCol,
                    styles.centered,
                    punch.Type === 'Punch'
                      ? styles.punchBackgroundColor
                      : styles.testPunchBackgroundColor,
                  ]}>
                  <Icon
                    source={getTypeIcon(punch.TypeName)}
                    size={18}
                    color={getTypeColor(punch.TypeName)}
                  />
                </DataTable.Cell>
                <DataTable.Cell
                  textStyle={{fontSize: 20}}
                  style={[
                    punch.Type === 'Punch'
                      ? styles.punchBackgroundColor
                      : styles.testPunchBackgroundColor,
                    styles.centered,
                    {flex: 1.5},
                  ]}>
                  {punch.Time}
                </DataTable.Cell>
                <DataTable.Cell
                  textStyle={{fontSize: 20}}
                  style={[
                    {width: 50, justifyContent: 'center'},
                    punch.Type === 'Punch'
                      ? styles.punchBackgroundColor
                      : styles.testPunchBackgroundColor,
                  ]}>
                  {punch.RSSI}
                </DataTable.Cell>
                {isRak3172 && (
                  <DataTable.Cell
                    textStyle={{fontSize: 20}}
                    style={[
                      {width: 40, justifyContent: 'center'},
                      punch.Type === 'Punch'
                        ? styles.punchBackgroundColor
                        : styles.testPunchBackgroundColor,
                    ]}>
                    {punch.SNR}
                  </DataTable.Cell>
                )}
                <DataTable.Cell
                  textStyle={{fontSize: 20}}
                  style={[
                    {width: 45},
                    punch.Type === 'Punch'
                      ? [styles.punchBackgroundColor, styles.centered]
                      : isSettled(punch)
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
                  style={[{flex: 1.5}, getStatusStyle(punch)]}>
                  {getStatusDisplayName(punch.Status)}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </ScrollView>
          <Divider bold={true} />
          <DataTable.Row key={'footer'} style={styles.row}>
            <DataTable.Cell textStyle={{fontSize: 22}} style={{flex: 3}}>
              {t('Procent lyckade')}
            </DataTable.Cell>
            <DataTable.Cell
              textStyle={{fontSize: 22}}
              style={{
                width: 40,
                justifyContent: 'center',
                paddingHorizontal: 0,
              }}>
              {formatPercentage(
                punches.filter(
                  p =>
                    p.Type === 'TestPunch' &&
                    (p.Status === 'Acked' ||
                      (isTcpStyleOutput(p.TypeName) && p.Status === 'Sent')),
                ).length /
                  punches
                    .filter(punch => {
                      return punch.Type === 'TestPunch';
                    })
                    .map(p => p.NoOfSendTries)
                    .reduce((a, b) => a + b, 0),
              )}
            </DataTable.Cell>
            <DataTable.Cell
              textStyle={{fontSize: 22}}
              style={{width: 40, justifyContent: 'center'}}>
              {formatPercentage(
                punches.filter(
                  p =>
                    p.Type === 'TestPunch' &&
                    (p.Status === 'Acked' ||
                      (isTcpStyleOutput(p.TypeName) && p.Status === 'Sent')),
                ).length /
                  punches.filter(punch => {
                    return punch.Type === 'TestPunch';
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
    paddingLeft: 2,
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
    justifyContent: 'center',
  },
  symbolCol: {
    flex: 0,
    width: 26,
    paddingHorizontal: 0,
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
