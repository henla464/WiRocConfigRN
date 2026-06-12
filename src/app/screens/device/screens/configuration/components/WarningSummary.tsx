import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

import {useWiRocPropertyQuery} from '@lib/hooks/useWiRocPropertyQuery';
import {BluetoothDevice} from '@api/index';

import WarningIcon from './WarningIcon';

interface WarningSummaryProps {
  deviceId: string;
}

export default function WarningSummary({deviceId}: WarningSummaryProps) {
  const {t} = useTranslation();

  const {data: srrMode} = useWiRocPropertyQuery(deviceId, 'srr/mode');
  const {data: loraMode} = useWiRocPropertyQuery(deviceId, 'loramode');
  const {data: codeRate} = useWiRocPropertyQuery(deviceId, 'coderate');
  const {data: loraPower} = useWiRocPropertyQuery(deviceId, 'power');
  const {data: rs232Mode} = useWiRocPropertyQuery(deviceId, 'rs232mode');
  const {data: wifiMeshEnabled} = useWiRocPropertyQuery(
    deviceId,
    'wifimesh/enabled',
  );
  const {data: wakeUpEnabled} = useWiRocPropertyQuery(
    deviceId,
    'rtc/wakeupenabled',
  );
  const {data: wakeUpTime} = useWiRocPropertyQuery(deviceId, 'rtc/wakeup');
  const {data: acknowledgementRequested} = useWiRocPropertyQuery(
    deviceId,
    'acknowledgementrequested',
  );
  const {data: serialBTDevices} = useWiRocPropertyQuery(
    deviceId,
    'scanbtaddresses',
  );

  const warnings: string[] = [];

  if (srrMode !== undefined && srrMode === 'SEND') {
    warnings.push(t('warn_srr_send'));
  }
  if (loraMode !== undefined && loraMode === 'REPEATER') {
    warnings.push(t('warn_lora_repeater'));
  }
  if (codeRate !== undefined && codeRate !== 0) {
    warnings.push(t('warn_lora_code_rate'));
  }
  if (loraPower !== undefined && loraPower !== 22) {
    warnings.push(t('warn_lora_power'));
  }
  if (acknowledgementRequested !== undefined && !acknowledgementRequested) {
    warnings.push(t('warn_lora_no_ack'));
  }
  if (rs232Mode !== undefined && rs232Mode === 'SEND') {
    warnings.push(t('warn_rs232_send'));
  }
  if (serialBTDevices !== undefined) {
    const hasUnconnected = (serialBTDevices as BluetoothDevice[]).some(
      d => d.Status !== 'Connected',
    );
    if (hasUnconnected) {
      warnings.push(t('warn_serial_bt_not_connected'));
    }
  }
  if (wifiMeshEnabled) {
    warnings.push(t('warn_wifi_mesh'));
  }
  if (wakeUpEnabled) {
    warnings.push(
      t('warn_rtc_wakeup') +
        (wakeUpTime !== undefined ? ' ' + wakeUpTime : ''),
    );
  }

  if (warnings.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('Varningar')}</Text>
      {warnings.map((warning, index) => (
        <View key={index} style={styles.warningRow}>
          <WarningIcon size={16} />
          <Text style={styles.warningText}>{warning}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8E1',
    borderLeftColor: '#FF8F00',
    borderLeftWidth: 4,
    borderRadius: 4,
    padding: 12,
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 8,
  },
  header: {
    fontWeight: 'bold',
    color: '#E65100',
    fontSize: 16,
    marginBottom: 8,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  warningText: {
    fontSize: 14,
    color: '#424242',
    marginLeft: 6,
  },
});
