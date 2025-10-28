import React, {useCallback, useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {
  Divider,
  MaterialBottomTabScreenProps,
  Text,
  useTheme,
} from 'react-native-paper';

import {SettablePropName, SettableValues} from '@api/transformers';
import {Notifications} from '@lib/components/Notifications';
import SaveBanner from '@lib/components/SaveBanner';
import {useActiveWiRocDevice} from '@lib/hooks/useActiveWiRocDevice';
import {
  useWiRocPropertiesMutation,
  useWiRocPropertyQuery,
} from '@lib/hooks/useWiRocPropertyQuery';

import {ConfigurationTabParamList} from '../../types';
import LoraRadio from './components/LoraRadio';
import RS232 from './components/RS232';
import SIRAP from './components/SIRAP';
import SRR from './components/SRR';
import SerialBluetooth from './components/SerialBluetooth';
import USB from './components/USB';

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
  const deviceId = useActiveWiRocDevice();
  const [defaultValues, setDefaultValues] = useState<Partial<SettableValues>>(
    {},
  );

  const form = useForm<Partial<SettableValues>>({
    defaultValues: {},
    mode: 'onChange',
  });

  const [scrollViewRef, setScrollViewRef] = useState<ScrollView | null>(null);

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

  const {data: hasSRR} = useWiRocPropertyQuery(deviceId, 'hashw/srr', {
    // This request throws if the hardware does not have SRR,
    // so don't bother the automatic reatry...
    retry: false,
  });

  const [mTop, setMTop] = useState(0);
  const [currentScrollPosition, setCurrentScrollPosition] = useState(0);

  const commonSectionProps = {
    deviceId,
    onDefaultValuesChange,
  };

  const {colors} = useTheme();

  return (
    <View style={{flex: 1, backgroundColor: colors.background}}>
      <FormProvider {...form}>
        <SafeAreaView>
          <Notifications />
          <SaveBanner
            visible={formState.isDirty}
            isSaveDisabled={!formState.isValid}
            errors={formState.errors}
            save={handleSubmit(onSubmit)}
            reload={() => reset()}
            onHideAnimationFinished={() => {
              setMTop(0);
              scrollViewRef?.scrollTo({
                x: 0,
                y: currentScrollPosition - 133,
                animated: false,
              });
            }}
            onShowAnimationFinished={() => {
              setMTop(133);
              scrollViewRef?.scrollTo({
                x: 0,
                y: currentScrollPosition + 133,
                animated: false,
              });
            }}
          />
          <ScrollView
            ref={ref => {
              setScrollViewRef(ref);
            }}
            onScroll={e => {
              setCurrentScrollPosition(e.nativeEvent.contentOffset.y);
            }}
            style={{marginTop: mTop}}>
            <View style={{backgroundColor: 'orange'}}>
              <Divider bold={true} />
              <Text style={styles.header}>Indata</Text>
              <Divider bold={true} />
              <USB {...commonSectionProps} />
              <Divider bold={true} />
              <SerialBluetooth {...commonSectionProps} />
              <Divider bold={true} />
              {hasSRR && <SRR {...commonSectionProps} />}
              {hasSRR && <Divider bold={true} />}
            </View>
            <View style={{backgroundColor: 'orange'}}>
              <Divider bold={true} />
              <Text style={styles.header}>In- och utdata</Text>
              <Divider bold={true} />
              <LoraRadio {...commonSectionProps} />
              <Divider bold={true} />
              <RS232 {...commonSectionProps} />
            </View>
            <View style={{backgroundColor: 'orange'}}>
              <Divider bold={true} />
              <Text style={styles.header}>Utdata</Text>
              <Divider bold={true} />
              <SIRAP {...commonSectionProps} />
              <Divider bold={true} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </FormProvider>
    </View>
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
