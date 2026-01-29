import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
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
import {ListItemMenu, ListItemMenuItem} from '@lib/components/ListItemMenu';
import {SrrMode} from '@api/index';

export default function SRR({
  deviceId,
  onDefaultValuesChange,
}: SectionComponentProps) {
  const {t} = useTranslation();
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
        onChange: setIsBlueChannelListenOnly,
      },
    },
  ] = useConfigurationProperty(
    deviceId,
    'srr/bluechannellistenonly',
    onDefaultValuesChange,
  );

  const modeOptions = [
    {value: 'RECEIVE', label: t('Mottagare'), icon: 'login', disabled: false},
    {value: 'SEND', label: t('Sändare'), icon: 'logout', disabled: true},
  ];
  const selectedModeOption = modeOptions.find(m => m.value === SRRMode);

  return (
    <List.Accordion
      title={t('SportIdent SRR')}
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
          <Text>{SRRMode === 'RECEIVE' ? t('Mottagare') : t('Sändare')}</Text>
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
          <List.Item
            title={t('SRR')}
            description={isSRREnabled ? t('På') : t('Av')}
            disabled={typeof isSRREnabled !== 'boolean'}
            style={{
              opacity: typeof isSRREnabled === 'boolean' ? undefined : 0.5,
            }}
            left={props => <List.Icon {...props} icon="power" />}
            right={props => (
              <Switch
                {...props}
                value={isSRREnabled}
                onValueChange={() => {
                  setIsSRREnabled(!isSRREnabled);
                }}
              />
            )}
          />
          <ListItemMenu
            disabled={!isSRREnabled}
            title={t('Radiofunktion')}
            description={selectedModeOption?.label}
            icon={selectedModeOption?.icon}>
            {modeOptions.map(item => (
              <ListItemMenuItem
                key={item.value}
                title={item.label}
                leadingIcon={item.icon}
                disabled={item.disabled}
                onPress={() => {
                  setSRRMode(item.value as SrrMode);
                }}
              />
            ))}
          </ListItemMenu>
          <List.Item
            title={t('Röd kanal')}
            description={isRedChannelEnabled ? t('På') : t('Av')}
            disabled={typeof isSRREnabled !== 'boolean'}
            style={{
              opacity: typeof isSRREnabled === 'boolean' ? undefined : 0.5,
            }}
            left={props => <List.Icon {...props} icon="sine-wave" />}
            right={props => (
              <Switch
                {...props}
                value={isRedChannelEnabled}
                onValueChange={() => {
                  setIsRedChannelEnabled(!isRedChannelEnabled);
                }}
              />
            )}
          />
          <List.Item
            title={t('Röd kanal: Lyssna endast')}
            description={
              isRedChannelListenOnly
                ? t('Inga bekräftelser skickas på mottagna SRR-stämplingar')
                : t('Bekräftelse skickas')
            }
            disabled={
              !isSRREnabled || !isRedChannelEnabled || SRRMode === 'SEND'
            }
            style={{
              opacity:
                !isSRREnabled || !isRedChannelEnabled || SRRMode === 'SEND'
                  ? 0.5
                  : undefined,
            }}
            left={props => <List.Icon {...props} icon="reply" />}
            right={props => (
              <Switch
                {...props}
                value={isRedChannelListenOnly}
                disabled={
                  !isSRREnabled || !isRedChannelEnabled || SRRMode === 'SEND'
                }
                onValueChange={() => {
                  setIsRedChannelListenOnly(!isRedChannelListenOnly);
                }}
              />
            )}
          />
          <List.Item
            title={t('Blå kanal')}
            description={isBlueChannelEnabled ? t('På') : t('Av')}
            disabled={typeof isSRREnabled !== 'boolean'}
            style={{
              opacity: typeof isSRREnabled === 'boolean' ? undefined : 0.5,
            }}
            left={props => <List.Icon {...props} icon="square-wave" />}
            right={props => (
              <Switch
                {...props}
                value={isBlueChannelEnabled}
                onValueChange={() => {
                  setIsBlueChannelEnabled(!isBlueChannelEnabled);
                }}
              />
            )}
          />
          <List.Item
            title={t('Blå kanal: Lyssna endast')}
            description={
              isBlueChannelListenOnly
                ? t('Inga bekräftelser skickas på mottagna SRR-stämplingar')
                : t('Bekräftelse skickas')
            }
            disabled={
              !isSRREnabled || !isBlueChannelEnabled || SRRMode === 'SEND'
            }
            style={{
              opacity:
                !isSRREnabled || !isBlueChannelEnabled || SRRMode === 'SEND'
                  ? 0.5
                  : undefined,
            }}
            left={props => <List.Icon {...props} icon="reply" />}
            right={props => (
              <Switch
                {...props}
                value={isBlueChannelListenOnly}
                disabled={
                  !isSRREnabled || !isBlueChannelEnabled || SRRMode === 'SEND'
                }
                onValueChange={() => {
                  setIsBlueChannelListenOnly(!isBlueChannelListenOnly);
                }}
              />
            )}
          />
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
