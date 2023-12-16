import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';
import {ScrollView} from 'react-native-gesture-handler';
import {Button, Icon} from 'react-native-paper';

interface ISelectItems {
  key: string;
  value: string;
}
export default function Update() {
  const [currentWiRocVersion, setCurrentWiRocVersion] =
    useState<string>('v0.253');
  const [currentWiRocBLEAPIVersion, setCurrentWiRocBLEAPIVersion] =
    useState<string>('v0.12');
  const [wiRocVersion, setWiRocVersion] = useState<string>('v0.253');
  const [wiRocBLEAPIVersion, setWiRocBLEAPIVersion] = useState<string>('v0.12');

  const [wiRocVersionList, setWiRocVersionList] = useState<ISelectItems[]>([
    {key: 'v0.253', value: 'v0.253'},
    {key: 'v0.254', value: 'v0.254'},
    {key: 'v0.255', value: 'v0.255'},
    {key: 'v0.256', value: 'v0.256'},
  ]);

  const [wiRocBLEAPIVersionList, setWiRocBLEAPIVersionList] = useState<
    ISelectItems[]
  >([
    {key: 'v0.12', value: 'v0.12'},
    {key: 'v0.13', value: 'v0.13'},
    {key: 'v0.14', value: 'v0.14'},
    {key: 'v0.15', value: 'v0.15'},
  ]);

  return (
    <View style={styles.container}>
      <View style={(styles.containerRow, {width: '100%'})}>
        <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 30}}>
          Nuvarande WiRoc version: {currentWiRocVersion}
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
          defaultOption={{key: wiRocVersion, value: wiRocVersion}}
        />
      </View>
      <View style={styles.containerRow}>
        <Button
          icon=""
          mode="contained"
          onPress={() => {}}
          style={[styles.button, {flex: 1, marginRight: 0, marginTop: 20}]}>
          Uppdatera till ny WiRoc version
        </Button>
      </View>

      <View style={(styles.containerRow, {width: '100%', marginTop: 40})}>
        <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 30}}>
          Nuvarande WiRoc BLE API version: {currentWiRocBLEAPIVersion}
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
          defaultOption={{key: wiRocBLEAPIVersion, value: wiRocBLEAPIVersion}}
        />
      </View>
      <View style={styles.containerRow}>
        <Button
          icon=""
          mode="contained"
          onPress={() => {}}
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
