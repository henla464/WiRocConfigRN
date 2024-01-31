import React, {useEffect, useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {Button, IconButton} from 'react-native-paper';
import useInterval from '../hooks/useInterval';
import {useBLEApiContext} from '../context/BLEApiContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import SaveBanner from './SaveBanner';
import {ScrollView} from 'react-native-gesture-handler';
import InformationModal from './InformationModal';

export default function WakeUp() {
  const BLEAPI = useBLEApiContext();

  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isInformationModalVisible, setIsInformationModalVisible] =
    useState<boolean>(false);

  const [isTimePickerVisible, setIsTimePickerVisible] =
    useState<boolean>(false);
  const [wiRocDateTime, setWiRocDateTime] = useState<string>('');

  const [phoneDateTime, setPhoneDateTime] = useState<string>('');

  const [wiRocWakeUpTime, setWiRocWakeUpTime] = useState<string>('');
  const [origWiRocWakeUpTime, setOrigWiRocWakeUpTime] = useState<string | null>(
    null,
  );

  const [
    wiRocWakeUpToBeEnabledAtShutdown,
    setWiRocWakeUpToBeEnabledAtShutdown,
  ] = useState<boolean>(false);
  const [
    origWiRocWakeUpToBeEnabledAtShutdown,
    setOrigWiRocWakeUpToBeEnabledAtShutdown,
  ] = useState<boolean | null>(null);

  const [triggerVersion, setTriggerVersion] = useState<number>(0);

  useInterval(() => {
    let dateTimeString = new Date().toLocaleString('sv-SE');
    //dateTimeString = dateTimeString.replaceAll('T', ' ');
    //dateTimeString = dateTimeString.substring(0, 19);
    setPhoneDateTime(dateTimeString);
  }, 10000);

  const updateFromWiRoc = (propName: string, propValue: string) => {
    console.log('WakeUp:updateFromWiRoc: propName: ' + propName);
    console.log('WakeUp:updateFromWiRoc: propValue: ' + propValue);
    switch (propName) {
      case 'rtc/datetime':
        setWiRocDateTime(propValue);
        break;
      case 'rtc/wakeup':
        setWiRocWakeUpTime(propValue);
        setOrigWiRocWakeUpTime(propValue);
        break;
      case 'rtc/wakeupenabled':
        setWiRocWakeUpToBeEnabledAtShutdown(parseInt(propValue, 10) !== 0);
        setOrigWiRocWakeUpToBeEnabledAtShutdown(parseInt(propValue, 10) !== 0);
        break;
    }
  };

  useEffect(() => {
    async function getWakeUpSettings() {
      if (BLEAPI.connectedDevice !== null) {
        let pc = BLEAPI.requestProperty(
          BLEAPI.connectedDevice,
          'WakeUp',
          'rtc/datetime|rtc/wakeup|rtc/wakeupenabled',
          updateFromWiRoc,
        );
      }
    }
    getWakeUpSettings();

    let dateTimeString = new Date().toLocaleString('sv-SE');
    setPhoneDateTime(dateTimeString);
  }, [BLEAPI, triggerVersion]);

  useEffect(() => {
    if (
      origWiRocWakeUpTime == null ||
      origWiRocWakeUpToBeEnabledAtShutdown === null
    ) {
      return;
    }
    if (
      origWiRocWakeUpTime !== wiRocWakeUpTime ||
      origWiRocWakeUpToBeEnabledAtShutdown !== wiRocWakeUpToBeEnabledAtShutdown
    ) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [
    wiRocWakeUpTime,
    wiRocWakeUpToBeEnabledAtShutdown,
    origWiRocWakeUpTime,
    origWiRocWakeUpToBeEnabledAtShutdown,
  ]);

  const SaveWakeUp = () => {
    if (BLEAPI.connectedDevice) {
      if (
        origWiRocWakeUpTime !== wiRocWakeUpTime ||
        wiRocWakeUpToBeEnabledAtShutdown !==
          origWiRocWakeUpToBeEnabledAtShutdown
      ) {
        if (wiRocWakeUpToBeEnabledAtShutdown) {
          // Only need to set wakeup time (it is enabled at the same time)
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'WakeUp',
            'rtc/wakeup',
            wiRocWakeUpTime,
            updateFromWiRoc,
          );
        } else {
          BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'WakeUp',
            'rtc/clearwakeup',
            null,
            updateFromWiRoc,
          );
        }
        // refresh wakeupenabled since and wakeup time from device
        BLEAPI.requestProperty(
          BLEAPI.connectedDevice,
          'WakeUp',
          'rtc/wakeupenabled|rtc/wakeup',
          updateFromWiRoc,
        );
      }
    }
  };

  const SetWiRocDateAndTime = () => {
    if (BLEAPI.connectedDevice) {
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
      console.log('dateTimeString: ' + dateTimeString);
      BLEAPI.saveProperty(
        BLEAPI.connectedDevice,
        'WakeUp',
        'rtc/datetime',
        dateTimeString,
        updateFromWiRoc,
      );
    } else {
      console.log('WakeUp:SetWiRocDateAndTime not connected to device');
    }
  };

  return (
    <ScrollView contentContainerStyle={{flexGrow: 1}}>
      <InformationModal
        closeModal={() => setIsInformationModalVisible(false)}
        modalVisible={isInformationModalVisible}
        message={
          'När WiRoc-enheten stängs av med knappen så aktiveras väckningen och det står då på displayen. Om enheten startas manuellt så avaktiveras väckningen och måste manuellt aktiveras här igen.'
        }
      />
      <SaveBanner
        visible={isDirty}
        save={SaveWakeUp}
        reload={() => {
          setTriggerVersion(triggerVersion + 1);
        }}
      />
      <View style={styles.container}>
        <View style={styles.containerRow}>
          <Text>Enhetens datum & tid: {wiRocDateTime}</Text>
        </View>
        <View style={styles.containerRow}>
          <Text>Telefonens datum & tid: {phoneDateTime}</Text>
        </View>
        <View style={styles.containerRow}>
          <Button
            icon=""
            mode="contained"
            onPress={() => {
              SetWiRocDateAndTime();
            }}
            style={[styles.button]}>
            Sätt WiRoc-enhetens datum & tid
          </Button>
        </View>

        <View style={styles.containerRowCenter}>
          <Text style={styles.header}>Väckningstid</Text>
        </View>
        <View style={[styles.containerRow, {paddingRight: 20}]}>
          <Text style={styles.text}>
            Aktivera väckning efter att enheten har stängts av:
          </Text>
          <IconButton
            icon="information-outline"
            selected
            size={40}
            onPress={() => {
              setIsInformationModalVisible(true);
            }}
          />
          <Switch
            style={{marginRight: 40, flex: 0.5}}
            value={wiRocWakeUpToBeEnabledAtShutdown}
            onValueChange={() => {
              setWiRocWakeUpToBeEnabledAtShutdown(
                !wiRocWakeUpToBeEnabledAtShutdown,
              );
            }}
          />
        </View>
        <View style={styles.containerRowCenter}>
          <Button
            disabled={!wiRocWakeUpToBeEnabledAtShutdown}
            icon=""
            mode="outlined"
            onPress={() => setIsTimePickerVisible(true)}
            style={styles.wakeUpButton}
            labelStyle={
              wiRocWakeUpToBeEnabledAtShutdown
                ? styles.wakeUpButtonLabelStyle
                : styles.wakeUpButtonDisabledLabelStyle
            }
            contentStyle={styles.wakeUpButtonContent}>
            {wiRocWakeUpTime}
          </Button>
          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            onConfirm={date => {
              setWiRocWakeUpTime(
                date.toLocaleTimeString('sv-SE').substring(0, 5),
              );
              setIsTimePickerVisible(false);
            }}
            onCancel={() => {
              setIsTimePickerVisible(false);
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}
/*
 
      */

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
    backgroundColor: 'lightgray',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingLeft: 5,
    paddingTop: 20,
    paddingRight: 5,
    paddingBottom: 0,
    backgroundColor: 'lightgray',
  },
  containerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 5,
    backgroundColor: 'lightgray',
  },
  containerRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 5,
    backgroundColor: 'lightgray',
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
