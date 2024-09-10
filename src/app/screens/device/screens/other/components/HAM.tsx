import React, {useCallback, useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {StyleSheet, Text, View} from 'react-native';
import {Checkbox, TextInput} from 'react-native-paper';

import {SettablePropName, SettableValues} from '@api/transformers';
import SaveBanner from '@lib/components/SaveBanner';
import {useActiveWiRocDevice} from '@lib/hooks/useActiveWiRocDevice';
import {useConfigurationProperty} from '@lib/hooks/useConfigurationProperty';
import {useWiRocPropertiesMutation} from '@lib/hooks/useWiRocPropertyQuery';

export default function HAM() {
  const deviceId = useActiveWiRocDevice();
  const [defaultValues, setDefaultValues] = useState<Partial<SettableValues>>(
    {},
  );

  type OnDefaultValuesChangeHandler = (values: Partial<SettableValues>) => void;
  const onDefaultValuesChange: OnDefaultValuesChangeHandler = useCallback(
    data => {
      setDefaultValues(prevState => ({
        ...prevState,
        ...data,
      }));
    },
    [],
  );

  const form = useForm<Partial<SettableValues>>({
    defaultValues: {},
    mode: 'onChange',
  });

  //const {data: isHamEnabled} = useWiRocPropertyQuery(deviceId, 'ham/enabled');

  const [
    {
      field: {value: isHamEnabled, onChange: setHamEnabled},
    },
  ] = useConfigurationProperty(deviceId, 'ham/enabled', onDefaultValuesChange, {
    control: form.control,
  });

  const [
    {
      field: {value: hamCallSign, onChange: setHamCallSign},
    },
  ] = useConfigurationProperty(
    deviceId,
    'ham/callsign',
    onDefaultValuesChange,
    {
      control: form.control,
    },
  );

  const [mTop, setMTop] = useState(0);
  const {reset, formState, handleSubmit} = form;

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

  return (
    <View style={styles.container}>
      <SaveBanner
        visible={formState.isDirty}
        isSaveDisabled={!formState.isValid}
        errors={formState.errors}
        save={handleSubmit(onSubmit)}
        reload={() => reset()}
        onHideAnimationFinished={() => {
          setMTop(0);
        }}
        onShowAnimationFinished={() => {
          setMTop(133);
        }}
      />
      <View style={(styles.containerRow, {width: '100%', marginTop: mTop})}>
        <View style={[styles.mainCheckBoxContainer]}>
          <Checkbox.Item
            status={isHamEnabled ? 'checked' : 'unchecked'}
            label="Amatörradio"
            position="leading"
            onPress={() => {
              setHamEnabled(!isHamEnabled);
            }}
          />
        </View>
      </View>

      <View>
        <TextInput
          disabled={!isHamEnabled}
          value={hamCallSign}
          onChangeText={setHamCallSign}
          label="Anropssignal"
          maxLength={10}
          style={{backgroundColor: 'rgb(255, 251, 255)'}}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingLeft: 10,
    paddingTop: 16,
    paddingRight: 10,
    paddingBottom: 0,
    backgroundColor: 'rgb(255, 251, 255)',
  },
  containerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 5,
  },
  mainCheckBoxContainer: {
    alignItems: 'flex-start',
  },
});
