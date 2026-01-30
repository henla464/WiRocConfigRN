import {useQueryClient} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {Button, IconButton, Switch, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

import {SettableValues} from '@api/transformers';
import SaveBanner from '@lib/components/SaveBanner';
import {useActiveWiRocDevice} from '@lib/hooks/useActiveWiRocDevice';
import useInterval from '@lib/hooks/useInterval';
import {
  useWiRocPropertyMutation,
  useWiRocPropertyQuery,
} from '@lib/hooks/useWiRocPropertyQuery';

import InformationModal from './InformationModal';

export default function WakeUp() {
  const {t} = useTranslation();
  const deviceId = useActiveWiRocDevice();
  const queryClient = useQueryClient();

  const [isInformationModalVisible, setIsInformationModalVisible] =
    useState<boolean>(false);

  const [isTimePickerVisible, setIsTimePickerVisible] =
    useState<boolean>(false);

  const [phoneDateTime, setPhoneDateTime] = useState<string>('');

  const {data: wiRocDateTime} = useWiRocPropertyQuery(deviceId, 'rtc/datetime');
  const {data: origWiRocWakeUpTime} = useWiRocPropertyQuery(
    deviceId,
    'rtc/wakeup',
  );
  const {data: origWiRocWakeUpToBeEnabledAtShutdown} = useWiRocPropertyQuery(
    deviceId,
    'rtc/wakeupenabled',
  );

  const {mutate: setDateTime} = useWiRocPropertyMutation(
    deviceId,
    'rtc/datetime',
  );

  const {mutate: clearWakeup} = useWiRocPropertyMutation(
    deviceId,
    'rtc/clearwakeup',
  );

  const {mutate: wakeup} = useWiRocPropertyMutation(deviceId, 'rtc/wakeup');

  const form = useForm<Partial<SettableValues>>({
    defaultValues: {
      'rtc/wakeup': origWiRocWakeUpTime,
      'rtc/wakeupenabled': origWiRocWakeUpToBeEnabledAtShutdown,
    },
  });

  useEffect(() => {
    form.reset({
      'rtc/wakeup': origWiRocWakeUpTime,
      'rtc/wakeupenabled': origWiRocWakeUpToBeEnabledAtShutdown,
    });
  }, [form, origWiRocWakeUpTime, origWiRocWakeUpToBeEnabledAtShutdown]);

  useInterval(() => {
    let dateTimeString = new Date().toLocaleString('sv-SE');
    //dateTimeString = dateTimeString.replaceAll('T', ' ');
    //dateTimeString = dateTimeString.substring(0, 19);
    setPhoneDateTime(dateTimeString);
  }, 1000);

  const SaveWakeUp = (data: Partial<SettableValues>) => {
    if (data['rtc/wakeupenabled'] && data['rtc/wakeup']) {
      // Only need to set wakeup time (it is enabled at the same time)
      wakeup(data['rtc/wakeup']);
    } else {
      clearWakeup();
    }
    // refresh wakeupenabled since and wakeup time from device
    queryClient.invalidateQueries({
      queryKey: [deviceId, 'rtc/wakeup'],
    });
    queryClient.invalidateQueries({
      queryKey: [deviceId, 'rtc/wakeupenabled'],
    });
  };

  const SetWiRocDateAndTime = () => {
    var options: Intl.DateTimeFormatOptions = {
      localeMatcher: 'lookup',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      formatMatcher: 'best fit',
      hour12: false,
    };

    let dateTimeString = new Date().toLocaleDateString('sv', options);
    setDateTime(dateTimeString);
  };

  const {data: hasRTC} = useWiRocPropertyQuery(deviceId, 'hashw/rtc');

  return (
    <ScrollView contentContainerStyle={{flexGrow: 1}}>
      <InformationModal
        closeModal={() => setIsInformationModalVisible(false)}
        modalVisible={isInformationModalVisible}
        message={t(
          'När WiRoc-enheten stängs av med knappen så aktiveras väckningen och det står då på displayen. Om enheten startas manuellt så avaktiveras väckningen och måste manuellt aktiveras här igen.',
        )}
      />
      <SaveBanner
        visible={form.formState.isDirty}
        save={form.handleSubmit(SaveWakeUp)}
        reload={() => {
          queryClient.invalidateQueries({
            queryKey: [deviceId, 'rtc/datetime'],
          });
          queryClient.invalidateQueries({
            queryKey: [deviceId, 'rtc/wakeup'],
          });
          queryClient.invalidateQueries({
            queryKey: [deviceId, 'rtc/wakeupenabled'],
          });
          form.reset();
        }}
      />
      <View style={styles.container}>
        <View style={styles.containerRow}>
          <Text>
            {t('Enhetens datum & tid')}: {wiRocDateTime}
          </Text>
        </View>
        <View style={styles.containerRow}>
          <Text>
            {t('Telefonens datum & tid')}: {phoneDateTime}
          </Text>
        </View>
        <View style={styles.containerRow}>
          <Button
            icon=""
            mode="contained"
            onPress={() => {
              SetWiRocDateAndTime();
            }}
            style={[styles.button]}>
            {t('Sätt WiRoc-enhetens datum & tid')}
          </Button>
        </View>
        {hasRTC && (
          <View>
            <View style={styles.containerRowCenter}>
              <Text style={styles.header}>{t('Väckningstid')}</Text>
            </View>
            <View style={[styles.containerRow, {paddingRight: 20}]}>
              <Text style={styles.text}>
                {t('Aktivera väckning efter att enheten har stängts av:')}
              </Text>
              <IconButton
                icon="information-outline"
                selected
                size={40}
                onPress={() => {
                  setIsInformationModalVisible(true);
                }}
              />
              <Controller
                control={form.control}
                name="rtc/wakeupenabled"
                render={({field: {value, onChange}}) => (
                  <Switch
                    style={{marginRight: 40, flex: 0.5}}
                    value={value}
                    onValueChange={onChange}
                  />
                )}
              />
            </View>
            <View style={styles.containerRowCenter}>
              <Controller
                control={form.control}
                name="rtc/wakeup"
                render={({field: {value, onChange}}) => (
                  <>
                    <Button
                      disabled={!form.watch('rtc/wakeupenabled')}
                      icon=""
                      mode="outlined"
                      onPress={() => setIsTimePickerVisible(true)}
                      style={styles.wakeUpButton}
                      labelStyle={
                        form.watch('rtc/wakeupenabled')
                          ? styles.wakeUpButtonLabelStyle
                          : styles.wakeUpButtonDisabledLabelStyle
                      }
                      contentStyle={styles.wakeUpButtonContent}>
                      {value}
                    </Button>
                    <DateTimePickerModal
                      isVisible={isTimePickerVisible}
                      mode="time"
                      onConfirm={date => {
                        onChange(
                          date.toLocaleTimeString('sv-SE').substring(0, 5),
                        );
                        setIsTimePickerVisible(false);
                      }}
                      onCancel={() => {
                        setIsTimePickerVisible(false);
                      }}
                    />
                  </>
                )}
              />
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  table: {
    paddingRight: 0,
    marginRight: 0,
  },
  row: {
    paddingRight: 5,
    paddingLeft: 10,
  },
  tableContainer: {
    paddingRight: 0,
    marginTop: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingLeft: 5,
    paddingTop: 20,
    paddingRight: 5,
    paddingBottom: 0,
    backgroundColor: 'rgb(255, 251, 255)',
  },
  containerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 5,
  },
  containerRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 5,
  },
  button: {
    flex: 1,
    padding: 10,
    margin: 10,
    marginLeft: 0,
  },
  wakeUpButton: {
    flex: 0.7,
    padding: 0,
    margin: 0,
  },
  wakeUpButtonLabelStyle: {
    color: 'black',
    fontSize: 80,
    height: 120,
    paddingTop: 80,
    paddingLeft: 0,
    margin: 0,
    fontWeight: '900',
  },
  wakeUpButtonDisabledLabelStyle: {
    color: 'grey',
    fontSize: 80,
    height: 120,
    paddingTop: 80,
    paddingLeft: 0,
    margin: 0,
    fontWeight: '900',
  },

  wakeUpButtonContent: {
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  wakeupTime: {
    fontSize: 100,
  },
  header: {
    color: 'black',
    fontSize: 30,
  },
  text: {
    fontSize: 20,
    flex: 1,
  },
});
