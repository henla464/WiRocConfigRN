import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  Checkbox,
  Divider,
  Icon,
  List,
  SegmentedButtons,
  Switch,
  Text,
} from 'react-native-paper';

import {useConfigurationProperty} from '@lib/hooks/useConfigurationProperty';

import {SectionComponentProps} from '../';
import OnOffChip from './OnOffChip';

export default function SRR({
  deviceId,
  onDefaultValuesChange,
}: SectionComponentProps) {
  const [expanded, setExpanded] = React.useState(false);
  const handlePress = () => setExpanded(!expanded);

  const [
    {
      field: {value: isSRREnabled, onChange: setIsSRREnabled},
    },
  ] = useConfigurationProperty(deviceId, 'srr/enabled', onDefaultValuesChange);

  const [
    {
      field: {value: SRRMode, onChange: setSRRMode},
    },
  ] = useConfigurationProperty(deviceId, 'srr/mode', onDefaultValuesChange);

  const [
    {
      field: {value: isRedChannelEnabled, onChange: setIsRedChannelEnabled},
    },
  ] = useConfigurationProperty(
    deviceId,
    'srr/redchannel',
    onDefaultValuesChange,
  );

  const [
    {
      field: {
        value: isRedChannelListenOnly,
        onChange: setIsRedChannelListenOnly,
      },
    },
  ] = useConfigurationProperty(
    deviceId,
    'srr/redchannellistenonly',
    onDefaultValuesChange,
  );

  const [
    {
      field: {value: isBlueChannelEnabled, onChange: setIsBlueChannelEnabled},
    },
  ] = useConfigurationProperty(
    deviceId,
    'srr/bluechannel',
    onDefaultValuesChange,
  );

  const [
    {
      field: {
        value: isBlueChannelListenOnly,
        onChange: SetIsBlueChannelListenOnly,
      },
    },
  ] = useConfigurationProperty(
    deviceId,
    'srr/bluechannellistenonly',
    onDefaultValuesChange,
  );

  return (
    <List.Accordion
      title="SportIdent SRR"
      id="srr"
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
          <Text>{SRRMode === 'RECEIVE' ? 'Ta emot' : 'Skicka'}</Text>
          <OnOffChip on={isSRREnabled} />
          {isExpanded ? (
            <Icon source="chevron-up" size={25} />
          ) : (
            <Icon source="chevron-down" size={25} />
          )}
        </View>
      )}>
      <Divider bold={true} />
      <View style={styles.container}>
        <View style={styles.containerColumn}>
          <View style={styles.switchContainer}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                alignItems: 'center',
              }}>
              Aktivera:{' '}
            </Text>
            <Switch
              value={isSRREnabled}
              onValueChange={val => setIsSRREnabled(val)}
            />
          </View>

          <SegmentedButtons
            value={SRRMode}
            onValueChange={setSRRMode}
            buttons={[
              {
                icon: 'login',
                value: 'RECEIVE',
                label: 'Ta emot',
                disabled: !isSRREnabled,
              },
              {
                icon: 'pan-horizontal',
                value: 'SEND',
                label: 'Skicka',
                disabled: true,
              },
            ]}
          />
        </View>
        <View style={styles.containerRow}>
          <Checkbox
            disabled={!isSRREnabled}
            status={isRedChannelEnabled ? 'checked' : 'unchecked'}
            onPress={() => {
              setIsRedChannelEnabled(!isRedChannelEnabled);
            }}
          />
          <Text>Röd kanal</Text>
        </View>
        <View style={styles.containerRow2}>
          <Checkbox
            disabled={
              !isSRREnabled || !isRedChannelEnabled || SRRMode === 'SEND'
            }
            status={isRedChannelListenOnly ? 'checked' : 'unchecked'}
            onPress={() => {
              setIsRedChannelListenOnly(!isRedChannelListenOnly);
            }}
          />
          <Text>Lyssna endast (röd kanal)</Text>
        </View>
        <View style={styles.containerRow3}>
          <Text>(bekräfta inte stämplingar)</Text>
        </View>

        <View style={styles.containerRow}>
          <Checkbox
            disabled={!isSRREnabled}
            status={isBlueChannelEnabled ? 'checked' : 'unchecked'}
            onPress={() => {
              setIsBlueChannelEnabled(!isBlueChannelEnabled);
            }}
          />
          <Text>Blå kanal</Text>
        </View>
        <View style={styles.containerRow2}>
          <Checkbox
            disabled={
              !isSRREnabled || !isBlueChannelEnabled || SRRMode === 'SEND'
            }
            status={isBlueChannelListenOnly ? 'checked' : 'unchecked'}
            onPress={() => {
              SetIsBlueChannelListenOnly(!isBlueChannelListenOnly);
            }}
          />
          <Text>Lyssna endast (blå kanal)</Text>
        </View>
        <View style={styles.containerRow3}>
          <Text>(bekräfta inte stämplingar)</Text>
        </View>
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
  containerColumn: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 10,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 1,

    alignItems: 'center',
  },
  containerColumnLeft: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 10,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 1,
    backgroundColor: 'blue',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  containerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 18,
    paddingTop: 1,
    paddingRight: 10,
    paddingBottom: 1,
  },
  containerRow2: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 30,
    paddingTop: 1,
    paddingRight: 10,
    paddingBottom: 1,
  },
  containerRow3: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 70,
    paddingTop: 1,
    paddingRight: 10,
    paddingBottom: 10,
  },
  switch: {
    marginLeft: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
    alignSelf: 'flex-start',
  },
});
