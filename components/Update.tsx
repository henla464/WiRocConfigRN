import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';
import {Button, Icon} from 'react-native-paper';
import {useBLEApiContext} from '../context/BLEApiContext';

interface ISelectItem {
  key: string;
  value: string;
}

const configObj = require('../config/config.json');

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
  const BLEAPI = useBLEApiContext();

  const [HWVersion, setHWVersion] = useState<string | null>(null);
  const [HWRevision, setHWRevision] = useState<string | null>(null);
  const [currentWiRocVersion, setCurrentWiRocVersion] = useState<string | null>(
    null,
  );
  const [currentWiRocBLEAPIVersion, setCurrentWiRocBLEAPIVersion] = useState<
    string | null
  >(null);
  const [wiRocVersion, setWiRocVersion] = useState<string | null>(null);
  const [wiRocBLEAPIVersion, setWiRocBLEAPIVersion] = useState<string | null>(
    null,
  );

  const [wiRocVersionList, setWiRocVersionList] = useState<ISelectItem[]>([]);

  const [wiRocBLEAPIVersionList, setWiRocBLEAPIVersionList] = useState<
    ISelectItem[]
  >([]);

  const updateFromWiRoc = (propName: string, propValue: string) => {
    console.log('Update:updateFromWiRoc: propName: ' + propName);
    console.log('Update:updateFromWiRoc: propValue: ' + propValue);
    switch (propName) {
      case 'wirochwversion':
        let revAndRel = propValue.substring(1).split('Rev');
        setHWVersion(revAndRel[0]);
        setHWRevision(revAndRel[1]);
        break;
      case 'wirocpythonversion':
        setCurrentWiRocVersion(propValue);
        break;
      case 'wirocbleapiversion':
        setCurrentWiRocBLEAPIVersion(propValue);
        break;
    }
  };

  useEffect(() => {
    if (BLEAPI.connectedDevice) {
      // wirochwversion
      BLEAPI.requestProperty(
        BLEAPI.connectedDevice,
        'Update',
        'wirochwversion|wirocpythonversion|wirocbleapiversion',
        updateFromWiRoc,
      );
      /*
      BLEAPI.requestProperty(
        BLEAPI.connectedDevice,
        'Update',
        'wirocpythonversion',
        (propName: string, propValue: string) => {
          if (propName === 'wirocpythonversion') {
            setCurrentWiRocVersion(propValue);
          }
        },
      );

      BLEAPI.requestProperty(
        BLEAPI.connectedDevice,
        'Update',
        'wirocbleversion',
        (propName: string, propValue: string) => {
          if (propName === 'wirocbleversion') {
            setCurrentWiRocBLEAPIVersion(propValue);
          }
        },
      );
      */
    }
  }, [BLEAPI]);

  const getWiRocVersions = useCallback(async (): Promise<IReleaseItem[]> => {
    try {
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
      const json = await response.json();
      return json;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [HWVersion, HWRevision]);

  useEffect(() => {
    if (BLEAPI.connectedDevice && HWVersion && HWRevision) {
      const fetchData = async () => {
        const releases = await getWiRocVersions();

        let ddReleases: ISelectItem[] = releases.map(rel => {
          return {key: rel.releaseName, value: rel.releaseName};
        });

        setWiRocVersionList(ddReleases);
      };

      fetchData();
    }
  }, [BLEAPI, HWRevision, HWVersion, getWiRocVersions]);

  const getBLEAPIVersions = useCallback(async (): Promise<IReleaseItem[]> => {
    try {
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
      const json = await response.json();
      return json;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, [HWVersion, HWRevision]);

  useEffect(() => {
    if (BLEAPI.connectedDevice && HWVersion && HWRevision) {
      const fetchData = async () => {
        const releases = await getBLEAPIVersions();

        let ddReleases: ISelectItem[] = releases.map(rel => {
          return {key: rel.releaseName, value: rel.releaseName};
        });

        setWiRocBLEAPIVersionList(ddReleases);
      };

      fetchData();
    }
  }, [BLEAPI, HWRevision, HWVersion, getBLEAPIVersions]);

  const updateBLEAPIVersion = async () => {
    try {
      if (BLEAPI.connectedDevice) {
        if (wiRocBLEAPIVersion) {
          await BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'Update',
            'upgradewirocble',
            wiRocBLEAPIVersion,
            (propName: string, propValue: string) => {
              console.log(
                'Update propName: ' +
                  propName +
                  ' propValue: ' +
                  propValue +
                  ' Implement error handling!',
              );
            },
          );
        }
      }
    } catch (e) {
      console.log('Update:updateBLEAPIVersion' + e);
    }
  };

  const updateWiRocVersion = async () => {
    try {
      if (BLEAPI.connectedDevice) {
        if (wiRocVersion) {
          await BLEAPI.saveProperty(
            BLEAPI.connectedDevice,
            'Update',
            'upgradewirocpython',
            wiRocVersion,
            (propName: string, propValue: string) => {
              console.log(
                'Update propName: ' +
                  propName +
                  ' propValue: ' +
                  propValue +
                  ' Implement error handling!',
              );
            },
          );
        }
      }
    } catch (e) {
      console.log('Update:updateWiRocVersion' + e);
    }
  };

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
          onPress={updateWiRocVersion}
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
          onPress={updateBLEAPIVersion}
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
