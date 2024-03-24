import {useQuery} from '@tanstack/react-query';
import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';
import {Button, Icon} from 'react-native-paper';

import {useActiveWiRocDevice} from '@lib/hooks/useActiveWiRocDevice';
import {useNotify} from '@lib/hooks/useNotify';
import {
  useWiRocPropertyMutation,
  useWiRocPropertyQuery,
} from '@lib/hooks/useWiRocPropertyQuery';

interface ISelectItem {
  key: string;
  value: string;
}

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
  const deviceId = useActiveWiRocDevice();
  const notify = useNotify();

  const [wiRocVersion, setWiRocVersion] = useState<string | null>(null);
  const [wiRocBLEAPIVersion, setWiRocBLEAPIVersion] = useState<string | null>(
    null,
  );

  const {data: hwVersionAndRevision} = useWiRocPropertyQuery(
    deviceId,
    'wirochwversion',
  );
  const HWVersion = hwVersionAndRevision?.substring(1).split('Rev')[0];
  const HWRevision = hwVersionAndRevision?.substring(1).split('Rev')[1];

  const {data: currentWiRocVersion} = useWiRocPropertyQuery(
    deviceId,
    'wirocpythonversion',
  );
  const {data: currentWiRocBLEAPIVersion} = useWiRocPropertyQuery(
    deviceId,
    'wirocbleapiversion',
  );

  const {data: wiRocPythonReleases} = useQuery({
    enabled: HWVersion !== undefined && HWRevision !== undefined,
    queryKey: ['wiRocPythonReleases', HWVersion, HWRevision],
    queryFn: async () => {
      const wirocPythonReleasesURL =
        'https://monitor.wiroc.se/api/v1/WiRocPython2Releases?sort=versionNumber desc&hwVersion=' +
        HWVersion +
        '&hwRevision=' +
        HWRevision;
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
      return json;
    },
  });

  const {data: wiRocBleReleases} = useQuery({
    enabled: HWVersion !== undefined && HWRevision !== undefined,
    queryKey: ['wiRocBleReleases', HWVersion, HWRevision],
    queryFn: async () => {
      const wirocBLEAPIReleasesURL =
        'https://monitor.wiroc.se/api/v1/WiRocBLEAPIReleases?sort=versionNumber desc&hwVersion=' +
        HWVersion +
        '&hwRevision=' +
        HWRevision;
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
      return json;
    },
  });

  const wiRocVersionList: ISelectItem[] = wiRocPythonReleases?.map(rel => {
    return {key: rel.releaseName, value: rel.releaseName};
  });

  const wiRocBLEAPIVersionList: ISelectItem[] = wiRocBleReleases?.map(rel => {
    return {key: rel.releaseName, value: rel.releaseName};
  });

  const {mutate: updateBLEAPIVersion} = useWiRocPropertyMutation(
    deviceId,
    'upgradewirocble',
    {
      onSuccess: () => {
        notify({
          type: 'info',
          message: 'Enheten kommer att uppdatera WiRoc BLE API-versionen',
        });
      },
      onError: () => {
        notify({
          type: 'error',
          message: 'Kunde inte uppdatera WiRoc BLE API version',
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
          message: 'Enheten kommer att uppdatera WiRoc-versionen',
        });
      },
      onError: () => {
        notify({
          type: 'error',
          message: 'Kunde inte uppdatera WiRoc BLE API version',
        });
      },
    },
  );

  // wiRocVersion
  return (
    <View style={styles.container}>
      <View style={(styles.containerRow, {width: '100%'})}>
        <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 30}}>
          Nuvarande WiRoc version: v{currentWiRocVersion}
        </Text>
        <SelectList
          setSelected={(val: string) => {
            console.log(val);
            setWiRocVersion(val);
          }}
          data={wiRocVersionList}
          save="key"
          search={false}
          placeholder={'Antal'}
          dropdownTextStyles={{fontSize: 30, flex: 1}}
          dropdownStyles={{backgroundColor: 'gray'}}
          inputStyles={{
            fontSize: 18,
            fontWeight: '900',
          }}
          boxStyles={{
            alignItems: 'center',
            paddingRight: 0,
            marginLeft: 0,
            marginTop: 20,
          }}
          arrowicon={<Icon source="chevron-down" size={35} color={'black'} />}
          defaultOption={{
            key: 'v' + currentWiRocVersion,
            value: 'v' + currentWiRocVersion,
          }}
        />
      </View>
      <View style={styles.containerRow}>
        <Button
          icon=""
          mode="contained"
          onPress={() => {
            if (wiRocVersion) {
              updateWiRocVersion(wiRocVersion);
            }
          }}
          style={[styles.button, {flex: 1, marginRight: 0, marginTop: 20}]}>
          Uppdatera till ny WiRoc version
        </Button>
      </View>

      <View style={(styles.containerRow, {width: '100%', marginTop: 40})}>
        <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 30}}>
          Nuvarande WiRoc BLE API version: v{currentWiRocBLEAPIVersion}
        </Text>
        <SelectList
          setSelected={(val: string) => {
            console.log(val);
            setWiRocBLEAPIVersion(val);
          }}
          data={wiRocBLEAPIVersionList}
          save="key"
          search={false}
          placeholder={'Antal'}
          dropdownTextStyles={{fontSize: 30, flex: 1}}
          dropdownStyles={{backgroundColor: 'gray'}}
          inputStyles={{
            fontSize: 18,
            fontWeight: '900',
          }}
          boxStyles={{
            alignItems: 'center',
            paddingRight: 0,
            marginLeft: 0,
            marginTop: 20,
          }}
          arrowicon={<Icon source="chevron-down" size={35} color={'black'} />}
          defaultOption={{
            key: 'v' + currentWiRocBLEAPIVersion,
            value: 'v' + currentWiRocBLEAPIVersion,
          }}
        />
      </View>
      <View style={styles.containerRow}>
        <Button
          icon=""
          mode="contained"
          onPress={() => {
            if (wiRocBLEAPIVersion) {
              updateBLEAPIVersion(wiRocBLEAPIVersion);
            }
          }}
          style={[styles.button, {flex: 1, marginRight: 0, marginTop: 20}]}>
          Uppdatera till ny WiRoc BLE API version
        </Button>
      </View>
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
    backgroundColor: 'lightgray',
  },
  containerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 5,
    backgroundColor: 'lightgray',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    padding: 10,
    margin: 10,
    marginLeft: 0,
  },
});
