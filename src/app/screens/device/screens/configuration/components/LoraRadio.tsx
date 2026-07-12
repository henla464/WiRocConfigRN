import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Divider, Icon, List, Switch, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

import {LoraMode, LoraRange} from '@api/index';
import {ListItemMenu, ListItemMenuItem} from '@lib/components/ListItemMenu';
import {useConfigurationProperty} from '@lib/hooks/useConfigurationProperty';
import {useWiRocPropertyQuery} from '@lib/hooks/useWiRocPropertyQuery';

import {SectionComponentProps} from '../';
import OnOffChip from './OnOffChip';
import WarningIcon from './WarningIcon';

export default function LoraRadio({
  deviceId,
  onDefaultValuesChange,
}: SectionComponentProps) {
  const {t} = useTranslation();
  const [expanded, setExpanded] = React.useState(false);
  const handlePress = () => setExpanded(!expanded);

  const [
    {
      field: {value: isLoraRadioEnabled, onChange: setLoraRadioEnabled},
    },
  ] = useConfigurationProperty(
    deviceId,
    'lora/enabled',
    onDefaultValuesChange,
    undefined,
    {defaultValue: true},
  );

  const [
    {
      field: {value: drf1268dsCompatMode, onChange: setDrf1268dsCompatMode},
    },
  ] = useConfigurationProperty(
    deviceId,
    'lora/drf1268dscompatmode',
    onDefaultValuesChange,
    undefined,
    {defaultValue: false},
  );

  const [
    {
      field: {value: channel, onChange: setChannel},
      fieldState: {error: channelError},
    },
  ] = useConfigurationProperty(deviceId, 'channel', onDefaultValuesChange, {
    rules: {
      validate: (value: string) => {
        if (
          drf1268dsCompatMode &&
          value !== undefined &&
          (value.endsWith('A') || value.endsWith('B'))
        ) {
          return 'Half channels not available in DRF1268DS compatibility mode';
        }
        return true;
      },
    },
  });

  const [
    {
      field: {value: loraMode, onChange: setLoraMode},
    },
  ] = useConfigurationProperty(deviceId, 'loramode', onDefaultValuesChange);

  const [
    {
      field: {value: loraRange, onChange: setLoraRange},
    },
  ] = useConfigurationProperty(deviceId, 'lorarange', onDefaultValuesChange);

  const [
    {
      field: {value: loraPower, onChange: setLoraPower},
    },
  ] = useConfigurationProperty(deviceId, 'power', onDefaultValuesChange);

  const [
    {
      field: {value: codeRate, onChange: setCodeRate},
    },
  ] = useConfigurationProperty(deviceId, 'coderate', onDefaultValuesChange);

  const [
    {
      field: {
        value: acknowledgementRequested,
        onChange: setAcknowledgementRequested,
      },
    },
  ] = useConfigurationProperty(
    deviceId,
    'acknowledgementrequested',
    onDefaultValuesChange,
  );

  const [
    {
      field: {value: isHamEnabled},
    },
  ] = useConfigurationProperty(deviceId, 'ham/enabled', onDefaultValuesChange);

  const [
    {
      field: {value: listenOnly, onChange: setListenOnly},
    },
  ] = useConfigurationProperty(
    deviceId,
    'lora/listenonly',
    onDefaultValuesChange,
    undefined,
    {defaultValue: false},
  );

  const {data: loraModule} = useWiRocPropertyQuery(deviceId, 'lora/module');
  const isRak3172 = loraModule === 'RAK3172';

  const {data: wiRocVersion} = useWiRocPropertyQuery(
    deviceId,
    'wirocpythonversion',
  );
  const versionParts = wiRocVersion?.split('.').map(Number);
  const isVersion123OrLater =
    versionParts !== undefined &&
    versionParts.length >= 2 &&
    (versionParts[0] > 1 || (versionParts[0] === 1 && versionParts[1] >= 23));

  const isNarrowChannel =
    channel !== undefined && (channel.endsWith('A') || channel.endsWith('B'));

  const modeOptions = [
    {value: 'RECEIVER', label: t('Mottagare'), icon: 'login'},
    {value: 'SENDER', label: t('Sändare'), icon: 'logout'},
    {value: 'REPEATER', label: t('Repeterare'), icon: 'pan-horizontal'},
  ];
  const selectedModeOption = modeOptions.find(m => m.value === loraMode);

  const channelOptions = [
    {value: '1', label: '1'},
    {value: '2', label: '2'},
    {value: '3', label: '3'},
    {value: '4', label: '4'},
    {value: '5', label: '5'},
    {value: '6', label: '6'},
    ...(isRak3172
      ? [
          {value: '1A', label: '1A', disabled: drf1268dsCompatMode},
          {value: '1B', label: '1B', disabled: drf1268dsCompatMode},
          {value: '2A', label: '2A', disabled: drf1268dsCompatMode},
          {value: '2B', label: '2B', disabled: drf1268dsCompatMode},
          {value: '3A', label: '3A', disabled: drf1268dsCompatMode},
          {value: '3B', label: '3B', disabled: drf1268dsCompatMode},
          {value: '4A', label: '4A', disabled: drf1268dsCompatMode},
          {value: '4B', label: '4B', disabled: drf1268dsCompatMode},
          {value: '5A', label: '5A', disabled: drf1268dsCompatMode},
          {value: '5B', label: '5B', disabled: drf1268dsCompatMode},
          {value: '6A', label: '6A', disabled: drf1268dsCompatMode},
          {value: '6B', label: '6B', disabled: drf1268dsCompatMode},
        ]
      : []),
    {value: 'HAM1', label: 'HAM1', disabled: !isHamEnabled},
    {value: 'HAM2', label: 'HAM2', disabled: !isHamEnabled},
    {value: 'HAM3', label: 'HAM3', disabled: !isHamEnabled},
    {value: 'HAM4', label: 'HAM4', disabled: !isHamEnabled},
    {value: 'HAM5', label: 'HAM5', disabled: !isHamEnabled},
  ];
  const selectedChannelOption = channelOptions.find(c => c.value === channel);

  const codeRateOptions = [
    {
      value: 0,
      label: '4/4 (0 ECC bit, 4 data bits)',
      disabled: !isRak3172,
    },
    {value: 1, label: '4/5 (1 ECC bit, 4 data bits)'},
    {value: 2, label: '4/6 (2 ECC bits, 4 data bits)'},
    {value: 3, label: '4/7 (3 ECC bits, 4 data bits)'},
    {value: 4, label: '4/8 (4 ECC bits, 4 data bits)'},
  ];
  const selectedCodeRateOption = codeRateOptions.find(
    c => c.value === codeRate,
  );

  const rangeOptions = [
    {label: 'Ultra Long', value: 'UL', altValue: '', disabled: false},
    {label: 'eXtra Long', value: 'XL', altValue: '', disabled: false},
    {label: 'Long', value: 'L', altValue: '', disabled: false},
    {label: 'Medium Long', value: 'ML', altValue: '', disabled: false},
    {label: 'Medium Fast', value: 'MS', altValue: 'MF', disabled: false},
    {label: 'Fast', value: 'S', altValue: 'F', disabled: false},
    ...(isVersion123OrLater
      ? [
          {
            label: 'eXtra Fast',
            value: 'XF',
            altValue: '',
            disabled: isNarrowChannel,
          },
          {
            label: 'Ultra Fast',
            value: 'UF',
            altValue: '',
            disabled: isNarrowChannel,
          },
        ]
      : []),
  ];
  const selectedRangeOption = rangeOptions.find(
    r => r.value === loraRange || r.altValue === loraRange,
  );

  // BPS lookup table: [range][codeRateIndex] for half/full channels
  const bpsTableHalf: Record<string, number[]> = {
    UL: [102, 81, 68, 58, 51],
    XL: [184, 146, 122, 105, 92],
    L: [326, 260, 217, 186, 163],
    ML: [570, 455, 380, 326, 285],
    MF: [976, 781, 651, 558, 488],
    F: [1628, 1367, 1085, 930, 814],
  };
  const bpsTableFull: Record<string, number[]> = {
    UL: [92, 73, 61, 52, 46],
    XL: [168, 134, 112, 96, 84],
    L: [306, 244, 203, 174, 153],
    ML: [550, 439, 366, 314, 275],
    MF: [976, 781, 651, 558, 488],
    F: [1708, 1367, 1139, 977, 854],
    XF: [2930, 2344, 1953, 1674, 1465],
    UF: [4882, 3906, 3255, 2790, 2441],
  };
  const bpsTable = isNarrowChannel ? bpsTableHalf : bpsTableFull;
  const codeRateIndex = codeRate !== undefined ? codeRate : 1;
  // Normalize range aliases: the device may report MS or MF (same range),
  // and S or F (same range). Map everything to the canonical MF/F keys.
  const rangeCanonical: Record<string, string> = {MS: 'MF', S: 'F'};
  const lookupKey = loraRange
    ? (rangeCanonical[loraRange] ?? loraRange)
    : undefined;
  const computedBps =
    lookupKey && bpsTable[lookupKey]
      ? bpsTable[lookupKey][codeRateIndex]
      : null;

  const powerOptions = [
    {value: 1, label: '1 dBm'},
    {value: 2, label: '2 dBm'},
    {value: 3, label: '3 dbm'},
    {value: 4, label: '4 dbm'},
    {value: 5, label: '5 dbm'},
    {value: 6, label: '6 dbm'},
    {value: 7, label: '7 dbm'},
    {value: 8, label: '8 dbm'},
    {value: 9, label: '9 dbm'},
    {value: 10, label: '10 dbm'},
    {value: 11, label: '11 dbm'},
    {value: 12, label: '12 dbm'},
    {value: 13, label: '13 dbm'},
    {value: 14, label: '14 dbm'},
    {value: 15, label: '15 dbm'},
    {value: 16, label: '16 dbm (max 11 element yagi)'},
    {value: 17, label: '17 dbm'},
    {value: 18, label: '18 dbm'},
    {value: 19, label: '19 dbm (max 7 element yagi)'},
    {value: 20, label: '20 dbm'},
    {value: 21, label: '21 dbm'},
    {value: 22, label: '22 dbm (max 4 element yagi)'},
  ];
  const selectedPowerOption = powerOptions.find(p => p.value === loraPower);

  const defaultCodeRate = 1;

  const hasWarning =
    (loraMode !== undefined && loraMode === 'REPEATER') ||
    (codeRate !== undefined && codeRate !== defaultCodeRate) ||
    (loraPower !== undefined && loraPower !== 22) ||
    (loraMode !== undefined &&
      loraMode !== 'RECEIVER' &&
      acknowledgementRequested !== undefined &&
      !acknowledgementRequested) ||
    (loraMode === 'RECEIVER' && listenOnly !== undefined && listenOnly);

  return (
    <List.Accordion
      id="lora"
      title={t('Lora-radio')}
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
          <Text>
            {selectedModeOption &&
            selectedChannelOption &&
            selectedRangeOption ? (
              <>
                {selectedModeOption.label} ∙ {selectedChannelOption.label} ∙{' '}
                {selectedRangeOption.value}
              </>
            ) : null}
          </Text>
          {hasWarning && <WarningIcon />}
          {typeof isLoraRadioEnabled === 'boolean' && (
            <OnOffChip on={isLoraRadioEnabled} />
          )}
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
            title={t('Lora-radio')}
            description={isLoraRadioEnabled ? t('På') : t('Av')}
            disabled={typeof isLoraRadioEnabled !== 'boolean'}
            style={{
              opacity:
                typeof isLoraRadioEnabled === 'boolean' ? undefined : 0.5,
            }}
            left={props => <List.Icon {...props} icon="power" />}
            right={props => (
              <Switch
                {...props}
                value={isLoraRadioEnabled}
                onValueChange={setLoraRadioEnabled}
              />
            )}
          />
          <ListItemMenu
            disabled={!isLoraRadioEnabled}
            title={t('Radiofunktion')}
            description={selectedModeOption?.label}
            icon={selectedModeOption?.icon}>
            {modeOptions.map(item => (
              <ListItemMenuItem
                key={item.value}
                title={item.label}
                leadingIcon={item.icon}
                onPress={() => {
                  setLoraMode(item.value as LoraMode);
                }}
              />
            ))}
          </ListItemMenu>
          {isRak3172 && (
            <List.Item
              left={props => <List.Icon {...props} icon="chip" />}
              disabled={!isLoraRadioEnabled}
              style={{
                opacity: isLoraRadioEnabled ? undefined : 0.5,
              }}
              title={t('DRF1268DS kompatibilitetsläge')}
              description={
                drf1268dsCompatMode
                  ? t('Kompatibilitetsläge för DRF1268DS är aktiverat')
                  : t('Kompatibilitetsläge för DRF1268DS är avaktiverat')
              }
              right={props => (
                <Switch
                  {...props}
                  value={drf1268dsCompatMode}
                  onValueChange={value => {
                    setDrf1268dsCompatMode(value);
                  }}
                  disabled={!isLoraRadioEnabled}
                />
              )}
            />
          )}
          <ListItemMenu
            disabled={!isLoraRadioEnabled}
            icon="sine-wave"
            title={t('Kanal')}
            description={selectedChannelOption?.label}>
            {channelOptions.map(item => (
              <ListItemMenuItem
                key={item.value}
                title={item.label}
                onPress={() => {
                  setChannel(item.value);
                }}
                disabled={item.disabled}
              />
            ))}
          </ListItemMenu>
          <ListItemMenu
            disabled={!isLoraRadioEnabled}
            icon="signal-distance-variant"
            title={t('Räckvidd / Datahastighet')}
            description={
              selectedRangeOption
                ? selectedRangeOption.label +
                  (computedBps !== null ? ' (' + computedBps + ' bps)' : '')
                : '?'
            }>
            {rangeOptions.map(item => (
              <ListItemMenuItem
                key={item.value}
                title={item.label}
                disabled={item.disabled}
                onPress={() => {
                  setLoraRange(item.value as LoraRange);
                }}
              />
            ))}
          </ListItemMenu>
          {loraMode !== 'RECEIVER' && (
            <List.Item
              left={props => <List.Icon {...props} icon="reply" />}
              disabled={!isLoraRadioEnabled}
              style={{
                opacity: isLoraRadioEnabled ? undefined : 0.5,
              }}
              title={t('Begär bekräftelse')}
              description={
                acknowledgementRequested
                  ? t('Mottagaren ska bekräfta mottagen stämpling')
                  : t('Mottagaren bekräftar inte mottagen stämpling')
              }
              right={props => (
                <Switch
                  {...props}
                  value={acknowledgementRequested}
                  onValueChange={value => {
                    setAcknowledgementRequested(value);
                  }}
                  disabled={!isLoraRadioEnabled}
                />
              )}
            />
          )}
          {loraMode === 'RECEIVER' && (
            <List.Item
              left={props => <List.Icon {...props} icon="ear-hearing" />}
              disabled={!isLoraRadioEnabled}
              style={{
                opacity: isLoraRadioEnabled ? undefined : 0.5,
              }}
              title={t('Lyssna endast')}
              descriptionNumberOfLines={3}
              description={
                listenOnly
                  ? t(
                      'Inga bekräftelser skickas på mottagna Lora-meddelanden även om det begärs av sändaren',
                    )
                  : t(
                      'Bekräftelse skickas för mottagna Lora-meddelanden när det begärs av sändaren',
                    )
              }
              right={props => (
                <Switch
                  {...props}
                  value={listenOnly}
                  onValueChange={value => {
                    setListenOnly(value);
                  }}
                  disabled={!isLoraRadioEnabled}
                />
              )}
            />
          )}
          <ListItemMenu
            disabled={!isLoraRadioEnabled}
            icon="code-json"
            title="Code Rate"
            description={selectedCodeRateOption?.label}>
            {codeRateOptions.map(item => (
              <ListItemMenuItem
                key={item.value}
                title={item.label}
                disabled={item.disabled}
                onPress={() => {
                  setCodeRate(item.value);
                }}
              />
            ))}
          </ListItemMenu>
          <ListItemMenu
            disabled={!isLoraRadioEnabled}
            icon="transmission-tower-export"
            title={t('Uteffekt')}
            description={selectedPowerOption?.label}>
            {powerOptions.map(item => (
              <ListItemMenuItem
                key={item.value}
                title={item.label}
                onPress={() => {
                  setLoraPower(item.value);
                }}
              />
            ))}
          </ListItemMenu>
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
    paddingLeft: 4,
    paddingTop: 10,
    paddingRight: 4,
    paddingBottom: 10,
    alignItems: 'center',
  },
});
