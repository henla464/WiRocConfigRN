import React, {useCallback, useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Divider, List, MaterialBottomTabScreenProps} from 'react-native-paper';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import SIRAP from './SIRAP';
import RS232 from './RS232';
import USB from './USB';
import SerialBluetooth from './SerialBluetooth';
import LoraRadio from './LoraRadio';
import SRR from './SRR';
import SaveBanner from './SaveBanner';
import {Notifications} from './Notifications';
import {ConfigurationTabParamList} from '../types/navigation';
import {
  useWiRocPropertiesMutation,
  useWiRocPropertyQuery,
} from '../hooks/useWiRocPropertyQuery';
import {SettablePropName, SettableValues} from '../api/transformers';
import {FormProvider, useForm} from 'react-hook-form';
import {useActiveWiRocDevice} from '../hooks/useActiveWiRocDevice';

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
    console.log('ConfigurationScreen: Saving changed values', changedData);
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

  return (
    <FormProvider {...form}>
      <SafeAreaView style={Colors.lighter}>
        <Notifications />
        <SaveBanner
          visible={formState.isDirty}
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
          <List.AccordionGroup>
            <View>
              <Divider bold={true} />
              <Text style={styles.header}>Indata</Text>
              <Divider bold={true} />
              <USB {...commonSectionProps} />
              <SerialBluetooth {...commonSectionProps} />
              {hasSRR && <SRR {...commonSectionProps} />}
            </View>
            <View>
              <Divider bold={true} />
              <Text style={styles.header}>In- och utdata</Text>
              <Divider bold={true} />
              <LoraRadio {...commonSectionProps} />
              <RS232 {...commonSectionProps} />
            </View>
            <View>
              <Divider bold={true} />
              <Text style={styles.header}>Utdata</Text>
              <Divider bold={true} />
              <SIRAP {...commonSectionProps} />
            </View>
          </List.AccordionGroup>
        </ScrollView>
      </SafeAreaView>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 10,
    fontWeight: 'bold',
    fontSize: 20,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
