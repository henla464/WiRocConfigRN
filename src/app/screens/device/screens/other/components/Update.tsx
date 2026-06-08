import {useQuery, useQueryClient} from '@tanstack/react-query';
import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Dialog, List, Menu, Portal, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

import {useActiveWiRocDevice} from '@lib/hooks/useActiveWiRocDevice';
import useInterval from '@lib/hooks/useInterval';
import {useNotify} from '@lib/hooks/useNotify';
import {
  useWiRocPropertyMutation,
  useWiRocPropertyQuery,
} from '@lib/hooks/useWiRocPropertyQuery';
import {useStore} from '@store/index';
import {log} from '@lib/log';

const configObj = require('../../../../../../../config/config.json');

interface IReleaseItem {
  releaseName: string;
  versionNumber: number;
  releaseStatusId: number;
  minHWVersion: number;
  minHWRevision: number;
  maxHWVersion: number;
  maxHWRevision: number;
  releaseNote: string;
  md5HashOfReleaseFile: string;
  id: number;
  updateTime: string;
  createdTime: string;
  releaseStatusDisplayName: string;
}

export default function Update() {
  const {t} = useTranslation();
  const deviceId = useActiveWiRocDevice();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const removeAllNotifications = useStore(
    state => state.removeAllNotifications,
  );

  const [wiRocVersion, setWiRocVersion] = useState<string | null>(null);
  const [wiRocBLEAPIVersion, setWiRocBLEAPIVersion] = useState<string | null>(
    null,
  );
  const [isWaitingForWiRocUpgrade, setIsWaitingForWiRocUpgrade] =
    useState(false);
  const [originalWiRocVersion, setOriginalWiRocVersion] = useState<
    string | null
  >(null);

  const {data: hwVersionAndRevision} = useWiRocPropertyQuery(
    deviceId,
    'wirochwversion',
  );
  const HWVersion = hwVersionAndRevision?.substring(1).split('Rev')[0];
  const HWRevision = hwVersionAndRevision?.substring(1).split('Rev')[1];

  const {data: currentWiRocVersion, refetch: refetchWiRocPythonVersion} =
    useWiRocPropertyQuery(deviceId, 'wirocpythonversion');

  const {data: currentWiRocBLEAPIVersion} = useWiRocPropertyQuery(
    deviceId,
    'wirocbleapiversion',
  );
  const activeDeviceId = useStore(state => state.activeDeviceId);

  const {data: wiRocPythonReleases = []} = useQuery<IReleaseItem[]>({
    enabled: HWVersion !== undefined && HWRevision !== undefined,
    queryKey: ['wiRocPythonReleases', HWVersion, HWRevision],
    queryFn: async () => {
      const wirocPythonReleasesURL =
        'https://monitor.wiroc.se/api/v1/WiRocPython2Releases?sort=versionNumber desc&hwVersion=' +
        HWVersion +
        '&hwRevision=' +
        HWRevision +
        '&BTAddress=' +
        activeDeviceId;
      const response = await fetch(wirocPythonReleasesURL, {
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': configObj.apiKey,
        },
      });
      if (!response.ok) {
        throw new Error('Could not fetch WiRoc Python releases');
      }
      const json = await response.json();
      log.debug(json);
      return json;
    },
  });

  const {data: wiRocBleReleases = []} = useQuery<IReleaseItem[]>({
    enabled: HWVersion !== undefined && HWRevision !== undefined,
    queryKey: ['wiRocBleReleases', HWVersion, HWRevision],
    queryFn: async () => {
      const wirocBLEAPIReleasesURL =
        'https://monitor.wiroc.se/api/v1/WiRocBLEAPIReleases?sort=versionNumber desc&hwVersion=' +
        HWVersion +
        '&hwRevision=' +
        HWRevision +
        '&BTAddress=' +
        activeDeviceId;
      const response = await fetch(wirocBLEAPIReleasesURL, {
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': configObj.apiKey,
        },
      });
      if (!response.ok) {
        throw new Error('Could not fetch WiRoc BLE API releases');
      }
      const json = await response.json();
      log.debug(json);
      return json;
    },
  });

  const wiRocVersionList = wiRocPythonReleases.map(rel => ({
    key: rel.releaseName,
    value: rel.releaseName + ' (' + rel.releaseStatusDisplayName + ')',
  }));

  const wiRocBLEAPIVersionList = wiRocBleReleases.map(rel => ({
    key: rel.releaseName,
    value: rel.releaseName + ' (' + rel.releaseStatusDisplayName + ')',
  }));

  const {mutate: updateBLEAPIVersion} = useWiRocPropertyMutation(
    deviceId,
    'upgradewirocble',
    {
      onSuccess: () => {
        notify({
          type: 'info',
          message: t('Enheten kommer att uppdatera WiRoc BLE API-versionen'),
        });
      },
      onError: () => {
        notify({
          type: 'error',
          message: t('Kunde inte uppdatera WiRoc BLE API version'),
        });
      },
    },
  );

  const {mutate: updateWiRocVersion} = useWiRocPropertyMutation(
    deviceId,
    'upgradewirocpython',
    {
      onSuccess: () => {
        notify({
          type: 'info',
          message: t('WiRoc-versionen kommer att uppdateras'),
        });
        // Start polling the version until it changes, then invalidate cache
        setOriginalWiRocVersion(currentWiRocVersion ?? null);
        setIsWaitingForWiRocUpgrade(true);
      },
      onError: () => {
        notify({
          type: 'error',
          message: t('Kunde inte uppdatera WiRoc version'),
        });
      },
    },
  );

  const {mutate: setDateTime} = useWiRocPropertyMutation(
    deviceId,
    'rtc/datetime',
  );

  // Poll for version change after upgrade is triggered
  useInterval(
    () => {
      if (isWaitingForWiRocUpgrade && originalWiRocVersion !== null) {
        refetchWiRocPythonVersion()
          .then(({data}) => {
            if (data && data !== originalWiRocVersion) {
              log.info(
                `WiRoc Python version changed from ${originalWiRocVersion} to ${data}, invalidating cache`,
              );
              setIsWaitingForWiRocUpgrade(false);
              setOriginalWiRocVersion(null);
              // Replace the "upgrade started" notification with completion
              removeAllNotifications();
              notify({
                type: 'info',
                message: t('Enheten har uppdaterats till version') + ' ' + data,
              });
              queryClient.invalidateQueries({
                queryKey: ['wiRocDevice', deviceId],
              });
            }
          })
          .catch(() => {
            // Device may be busy, try again next interval
          });
      }
    },
    isWaitingForWiRocUpgrade ? 1000 : null,
  );

  const SetWiRocDateAndTime = () => {
    let options: Intl.DateTimeFormatOptions = {
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

  const [isVersionMenuOpen, setVersionMenuOpen] = useState(false);
  const [isBleVersionMenuOpen, setBleVersionMenuOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Menu
        visible={isVersionMenuOpen}
        onDismiss={() => setVersionMenuOpen(false)}
        anchorPosition="bottom"
        anchor={
          <List.Item
            title={t('Uppdatera WiRoc')}
            description={`${t('Nuvarande WiRoc version')}: v${currentWiRocVersion}`}
            left={props => <List.Icon icon="radio-handheld" {...props} />}
            right={props => <List.Icon icon="chevron-right" {...props} />}
            onPress={() => {
              setVersionMenuOpen(true);
            }}
          />
        }>
        {wiRocVersionList.map(item => (
          <Menu.Item
            contentStyle={{
              width: '100%',
            }}
            key={item.key}
            onPress={() => {
              setWiRocVersion(item.key);
              setVersionMenuOpen(false);
            }}
            title={item.value}
          />
        ))}
      </Menu>
      <Menu
        visible={isBleVersionMenuOpen}
        onDismiss={() => setBleVersionMenuOpen(false)}
        anchorPosition="bottom"
        anchor={
          <List.Item
            title={t('Uppdatera WiRoc BLE API')}
            description={`${t('Nuvarande WiRoc BLE API version')}: v${currentWiRocBLEAPIVersion}`}
            left={props => <List.Icon icon="bluetooth" {...props} />}
            right={props => <List.Icon icon="chevron-right" {...props} />}
            onPress={() => {
              setBleVersionMenuOpen(true);
            }}
          />
        }>
        {wiRocBLEAPIVersionList.map(item => (
          <Menu.Item
            contentStyle={{
              width: '100%',
            }}
            key={item.key}
            onPress={() => {
              setWiRocBLEAPIVersion(item.key);
              setBleVersionMenuOpen(false);
            }}
            title={item.value}
          />
        ))}
      </Menu>
      <Portal>
        <Dialog
          visible={wiRocVersion !== null}
          onDismiss={() => {
            setWiRocVersion(null);
          }}>
          <Dialog.Icon icon="alert" />
          <Dialog.Title>{t('Uppdatera WiRoc')}</Dialog.Title>
          <Dialog.Content>
            <Text>
              {t('Är du säker på att du vill uppdatera WiRoc från version')}{' '}
              {currentWiRocVersion} {t('till version')} {wiRocVersion}?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setWiRocVersion(null);
              }}>
              {t('Avbryt')}
            </Button>
            <Button
              onPress={() => {
                if (wiRocVersion) {
                  SetWiRocDateAndTime();
                  updateWiRocVersion(wiRocVersion);
                  setWiRocVersion(null);
                }
              }}>
              {t('Uppdatera')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Portal>
        <Dialog
          visible={wiRocBLEAPIVersion !== null}
          onDismiss={() => {
            setWiRocBLEAPIVersion(null);
          }}>
          <Dialog.Icon icon="alert" />
          <Dialog.Title>{t('Uppdatera WiRoc BLE API')}</Dialog.Title>
          <Dialog.Content>
            <Text>
              {t(
                'Är du säker på att du vill uppdatera WiRoc BLE API från version',
              )}{' '}
              {currentWiRocBLEAPIVersion} {t('till version')}{' '}
              {wiRocBLEAPIVersion}?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setWiRocBLEAPIVersion(null);
              }}>
              {t('Avbryt')}
            </Button>
            <Button
              onPress={() => {
                if (wiRocBLEAPIVersion) {
                  SetWiRocDateAndTime();
                  updateBLEAPIVersion(wiRocBLEAPIVersion);
                  setWiRocBLEAPIVersion(null);
                }
              }}>
              {t('Uppdatera')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingLeft: 10,
    paddingTop: 0,
    paddingRight: 10,
    paddingBottom: 0,
    backgroundColor: 'rgb(255, 251, 255)',
  },
});
