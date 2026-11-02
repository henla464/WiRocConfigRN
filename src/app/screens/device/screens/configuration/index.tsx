import React, {useCallback, useEffect, useRef, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {
  Divider,
  MaterialBottomTabScreenProps,
  Text,
  useTheme,
} from 'react-native-paper';

import {SettablePropName, SettableValues} from '@api/transformers';
import {KeyboardAvoidingContainer} from '@lib/components/KeyboardAvoidingContainer';
import {KeyboardAwareScrollView} from '@lib/components/KeyboardAwareScrollView';
import {Notifications} from '@lib/components/Notifications';
import SaveBanner from '@lib/components/SaveBanner';
import {useActiveWiRocDevice} from '@lib/hooks/useActiveWiRocDevice';
import {
  useWiRocPropertiesMutation,
  useWiRocPropertyQuery,
} from '@lib/hooks/useWiRocPropertyQuery';

import {ConfigurationTabParamList} from '../../types';
import LoraRadio, {isMeshLoraMode} from './components/LoraRadio';
import ROC from './components/ROC';
import RS232 from './components/RS232';
import SIRAP from './components/SIRAP';
import SRR from './components/SRR';
import SerialBluetooth from './components/SerialBluetooth';
import USB from './components/USB';
import WarningSummary from './components/WarningSummary';
import {useTranslation} from 'react-i18next';

type ConfigurationScreenProps = MaterialBottomTabScreenProps<
  ConfigurationTabParamList,
  'configuration'
>;

type OnDefaultValuesChangeHandler = (values: Partial<SettableValues>) => void;

export interface SectionComponentProps {
  deviceId: string;
  onDefaultValuesChange: OnDefaultValuesChangeHandler;
}

export default function ConfigurationScreen(_props: ConfigurationScreenProps) {
  const {t} = useTranslation();
  const deviceId = useActiveWiRocDevice();
  const [defaultValues, setDefaultValues] = useState<Partial<SettableValues>>(
    {},
  );

  const form = useForm<Partial<SettableValues>>({
    defaultValues: {},
    mode: 'onChange',
  });

  const scrollViewRef = useRef<ScrollView | null>(null);

  const {reset, formState, handleSubmit} = form;

  const onDefaultValuesChange: OnDefaultValuesChangeHandler = useCallback(
    data => {
      setDefaultValues(prevState => ({
        ...prevState,
        ...data,
      }));
    },
    [],
  );

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const {mutate} = useWiRocPropertiesMutation(deviceId);

  const onSubmit = (data: Partial<SettableValues>) => {
    const changedEntries = Object.entries(data).filter(([key]) => {
      return formState.dirtyFields[key as SettablePropName];
    });

    // The device validates the range against the current mesh mode, so apply a
    // new range before entering a mesh mode, and the mode first when leaving.
    const currentModeIsMesh = isMeshLoraMode(defaultValues['lora/mode']);
    const newModeIsMesh = isMeshLoraMode(
      data['lora/mode'] ?? defaultValues['lora/mode'],
    );
    const orderOf = (key: string) => {
      if (key === 'lora/lorarange') {
        return currentModeIsMesh && !newModeIsMesh ? 1 : newModeIsMesh ? -1 : 0;
      }
      if (key === 'lora/mode') {
        return currentModeIsMesh && !newModeIsMesh ? -1 : newModeIsMesh ? 1 : 0;
      }
      return 0;
    };
    changedEntries.sort(([a], [b]) => orderOf(a) - orderOf(b));

    mutate(Object.fromEntries(changedEntries));
    reset(undefined, {
      keepValues: true,
    });
  };

  const {data: hasSRR} = useWiRocPropertyQuery(deviceId, 'hashw/srr', {
    // This request throws if the hardware does not have SRR,
    // so don't bother the automatic reatry...
    retry: false,
    defaultValue: false,
  });

  const {data: hasRfcomm} = useWiRocPropertyQuery(deviceId, 'hashw/rfcomm', {
    retry: false,
    defaultValue: true,
  });

  const [mTop, setMTop] = useState(0);
  const [currentScrollPosition, setCurrentScrollPosition] = useState(0);

  const commonSectionProps = {
    deviceId,
    onDefaultValuesChange,
  };

  const {colors} = useTheme();

  return (
    <KeyboardAvoidingContainer style={{backgroundColor: colors.background}}>
      <FormProvider {...form}>
        <SafeAreaView style={{flex: 1}}>
          <Notifications />
          <SaveBanner
            visible={formState.isDirty}
            isSaveDisabled={!formState.isValid}
            errors={formState.errors}
            save={handleSubmit(onSubmit)}
            reload={() => reset()}
            onHideAnimationFinished={() => {
              requestAnimationFrame(() => {
                setMTop(0);
                scrollViewRef.current?.scrollTo({
                  x: 0,
                  y: currentScrollPosition - 133,
                  animated: false,
                });
              });
            }}
            onShowAnimationFinished={() => {
              requestAnimationFrame(() => {
                setMTop(133);
                scrollViewRef.current?.scrollTo({
                  x: 0,
                  y: currentScrollPosition + 133,
                  animated: false,
                });
              });
            }}
          />
          <KeyboardAwareScrollView
            ref={scrollViewRef}
            onScroll={e => {
              setCurrentScrollPosition(e.nativeEvent.contentOffset.y);
            }}
            style={{marginTop: mTop}}>
            <WarningSummary deviceId={deviceId} />
            <View style={{backgroundColor: 'orange'}}>
              <Divider bold={true} />
              <Text style={styles.header}>{t('Indata')}</Text>
              <Divider bold={true} />
              <USB {...commonSectionProps} />
              <Divider bold={true} />
              {hasRfcomm && <SerialBluetooth {...commonSectionProps} />}
              {hasRfcomm && <Divider bold={true} />}
            </View>
            <View style={{backgroundColor: 'orange'}}>
              <Divider bold={true} />
              <Text style={styles.header}>{t('In- och utdata')}</Text>
              <Divider bold={true} />
              <LoraRadio {...commonSectionProps} />
              <Divider bold={true} />
              <RS232 {...commonSectionProps} />
              <Divider bold={true} />
              {hasSRR && <SRR {...commonSectionProps} />}
              {hasSRR && <Divider bold={true} />}
            </View>
            <View style={{backgroundColor: 'orange'}}>
              <Divider bold={true} />
              <Text style={styles.header}>{t('Utdata')}</Text>
              <Divider bold={true} />
              <SIRAP {...commonSectionProps} />
              <Divider bold={true} />
              <ROC {...commonSectionProps} />
              <Divider bold={true} />
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </FormProvider>
    </KeyboardAvoidingContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 10,
    fontWeight: 'bold',
    fontSize: 20,
    backgroundColor: 'rgb(233, 223, 235)',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
