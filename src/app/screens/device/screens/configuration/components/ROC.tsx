import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Divider, Icon, List, Switch, Text} from 'react-native-paper';

import {useConfigurationProperty} from '@lib/hooks/useConfigurationProperty';
import {useWiRocPropertyQuery} from '@lib/hooks/useWiRocPropertyQuery';

import {SectionComponentProps} from '../';
import OnOffChip from './OnOffChip';
import WarningIcon from './WarningIcon';

export function parseWiRocDateTime(dateTimeStr: string): Date | null {
  if (!dateTimeStr) {
    return null;
  }
  // Try Swedish locale format: "2026-07-31 23:45:00"
  const match = dateTimeStr.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/,
  );
  if (match) {
    return new Date(
      parseInt(match[1], 10),
      parseInt(match[2], 10) - 1,
      parseInt(match[3], 10),
      parseInt(match[4], 10),
      parseInt(match[5], 10),
      parseInt(match[6], 10),
    );
  }
  // Fallback: try native parsing
  const d = new Date(dateTimeStr);
  return isNaN(d.getTime()) ? null : d;
}

export default function ROC({
  deviceId,
  onDefaultValuesChange,
}: SectionComponentProps) {
  const {t} = useTranslation();
  const [expanded, setExpanded] = React.useState(false);
  const handlePress = () => setExpanded(!expanded);

  const [
    {
      field: {value: isROCEnabled, onChange: setIsROCEnabled},
    },
  ] = useConfigurationProperty(
    deviceId,
    'roc/enabled',
    onDefaultValuesChange,
  );

  const {data: hasRTC} = useWiRocPropertyQuery(deviceId, 'hashw/rtc', {
    retry: false,
    defaultValue: false,
  });

  const {data: wiRocDateTime, refetch: refetchDateTime} = useWiRocPropertyQuery(deviceId, 'rtc/datetime', {
    enabled: isROCEnabled,
    staleTime: 0,
  });

  const showRTCWarning = isROCEnabled && !hasRTC;

  const [timeOffsetMinutes, setTimeOffsetMinutes] = React.useState<
    number | null
  >(null);

  // Refetch device time every time ROC is toggled on
  useEffect(() => {
    if (isROCEnabled) {
      refetchDateTime();
    }
  }, [isROCEnabled, refetchDateTime]);

  // Compute time offset once when device time is fetched (on ROC enable or first load)
  useEffect(() => {
    if (!isROCEnabled || !wiRocDateTime) {
      setTimeOffsetMinutes(null);
      return;
    }
    const deviceTime = parseWiRocDateTime(wiRocDateTime);
    if (!deviceTime) {
      setTimeOffsetMinutes(null);
      return;
    }
    const phoneTime = new Date();
    const diffMs = Math.abs(phoneTime.getTime() - deviceTime.getTime());
    setTimeOffsetMinutes(Math.round(diffMs / 60000));
  }, [isROCEnabled, wiRocDateTime]);

  const showTimeWarning = isROCEnabled && timeOffsetMinutes !== null && timeOffsetMinutes > 5;

  const hasAnyWarning = showRTCWarning || showTimeWarning;

  return (
    <List.Accordion
      title={t('ROC')}
      id="roc"
      expanded={expanded}
      onPress={handlePress}
      theme={{
        colors: {
          primary: 'black',
          background: expanded ? 'orange' : 'rgb(255, 251, 255)',
        },
      }}
      style={{
        backgroundColor: 'rgb(255, 251, 255)',
        marginLeft: 10,
      }}
      right={({isExpanded}) => (
        <View style={styles.accordionHeader}>
          {hasAnyWarning && <WarningIcon size={24} />}
          <OnOffChip on={isROCEnabled} />
          {isExpanded ? (
            <Icon source="chevron-up" size={25} />
          ) : (
            <Icon source="chevron-down" size={25} />
          )}
        </View>
      )}>
      <Divider bold={true} />
      <View style={styles.container}>
        <View style={styles.switchContainer}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              alignItems: 'center',
              paddingBottom: 8,
            }}>
            {t('Aktivera')}:{' '}
          </Text>
          <Switch
            value={isROCEnabled}
            onValueChange={val => {
              setIsROCEnabled(val);
            }}
          />
        </View>
        <Text variant="bodyMedium" style={{paddingLeft: 18, paddingBottom: 14}}>
          {t('Skicka stämplingar till ROC-server')}
        </Text>
        {showRTCWarning && (
          <View style={styles.warningContainer}>
            <View style={styles.warningRow}>
              <WarningIcon size={16} />
              <Text style={styles.warningText}>
                {t('warn_roc_no_rtc')}
              </Text>
            </View>
          </View>
        )}
        {showTimeWarning && (
          <View style={styles.warningContainer}>
            <View style={styles.warningRow}>
              <WarningIcon size={16} />
              <Text style={styles.warningText}>
                {t('warn_roc_time_offset', {minutes: timeOffsetMinutes})}
              </Text>
            </View>
          </View>
        )}
      </View>
    </List.Accordion>
  );
}

const styles = StyleSheet.create({
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'rgb(255, 251, 255)',
    marginLeft: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 18,
    paddingTop: 14,
    paddingRight: 10,
    paddingBottom: 1,
  },
  warningContainer: {
    backgroundColor: '#FFF8E1',
    borderLeftColor: '#FF8F00',
    borderLeftWidth: 4,
    borderRadius: 4,
    padding: 12,
    marginHorizontal: 10,
    marginBottom: 14,
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
    flexShrink: 1,
  },
});
