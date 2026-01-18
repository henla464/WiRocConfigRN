import React, {useCallback, useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Switch, List, Text, Button, DataTable} from 'react-native-paper';

import {SettablePropName, SettableValues} from '@api/transformers';
import SaveBanner from '@lib/components/SaveBanner';
import {useActiveWiRocDevice} from '@lib/hooks/useActiveWiRocDevice';
import {useConfigurationProperty} from '@lib/hooks/useConfigurationProperty';
import {
  useWiRocPropertiesMutation,
  useWiRocPropertyQuery,
} from '@lib/hooks/useWiRocPropertyQuery';
import {ListItemMenu, ListItemMenuItem} from '@lib/components/ListItemMenu';

export default function WifiMesh() {
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

  const form = useForm<SettableValues>({
    defaultValues: {},
    mode: 'onChange',
  });

  const [
    {
      field: {value: isWifiMeshEnabled, onChange: setWifiMeshEnabled},
    },
  ] = useConfigurationProperty(
    deviceId,
    'wifimesh/enabled',
    onDefaultValuesChange,
    {
      control: form.control,
    },
  );

  const [
    {
      field: {value: isGatewayEnabled, onChange: setGatewayEnabled},
    },
  ] = useConfigurationProperty(
    deviceId,
    'wifimesh/gateway/enabled',
    onDefaultValuesChange,
    {
      control: form.control,
    },
  );

  const [
    {
      field: {value: meshNodeNumber, onChange: setMeshNodeNumber},
    },
  ] = useConfigurationProperty(
    deviceId,
    'wifimesh/nodenumber',
    onDefaultValuesChange,
    {
      control: form.control,
      rules: {
        required: {
          value: isWifiMeshEnabled && !isGatewayEnabled,
          message: 'Nodnummer är obligatoriskt (ska vara unikt)',
        },
      },
    },
  );

  const meshNodeNumberOptions = [
    {value: '1', label: '1', disabled: !isGatewayEnabled},
    {value: '2', label: '2', disabled: isGatewayEnabled},
    {value: '3', label: '3'},
    {value: '4', label: '4'},
    {value: '5', label: '5'},
    {value: '6', label: '6'},
    {value: '7', label: '7'},
    {value: '8', label: '8'},
    {value: '9', label: '9'},
    {value: '10', label: '10'},
    {value: '11', label: '11'},
    {value: '12', label: '12'},
    {value: '13', label: '13'},
    {value: '14', label: '14'},
    {value: '15', label: '15'},
    {value: '16', label: '16'},
  ];
  const selectedMeshNodeNumberOptions = meshNodeNumberOptions.find(
    c => c.value === meshNodeNumber?.toString(),
  );

  const {
    data: meshInterfaceCreated,
    refetch: fetchOrRefreshMeshInterfaceCreated,
  } = useWiRocPropertyQuery(deviceId, 'wifimesh/interfacecreated');

  const {data: meshIPAddress, refetch: fetchOrRefreshIPAddress} =
    useWiRocPropertyQuery(deviceId, 'wifimesh/ipaddress');

  const {data: meshMACAddress, refetch: fetchOrRefreshMAC} =
    useWiRocPropertyQuery(deviceId, 'wifimesh/mac');

  const {data: {mpaths} = {mpaths: []}, refetch: fetchOrRefresh} =
    useWiRocPropertyQuery(deviceId, 'wifimesh/mpath', {
      enabled: false,
    });

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
    <ScrollView>
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
        <View style={(styles.containerColumn, {marginTop: mTop})}>
          <List.Item
            title="Wifi-Mesh"
            description={isWifiMeshEnabled ? 'På' : 'Av'}
            disabled={typeof isWifiMeshEnabled !== 'boolean'}
            style={{
              opacity: typeof isWifiMeshEnabled === 'boolean' ? undefined : 0.5,
            }}
            left={props => <List.Icon {...props} icon="power" />}
            right={props => (
              <Switch
                {...props}
                value={isWifiMeshEnabled}
                onValueChange={() => {
                  if (isWifiMeshEnabled) {
                    setGatewayEnabled(false);
                  }
                  setWifiMeshEnabled(!isWifiMeshEnabled);
                }}
              />
            )}
          />
          <List.Item
            title="Gateway (endast en nod, kopplad till nätverket)"
            description={isGatewayEnabled ? 'På' : 'Av'}
            disabled={
              typeof isWifiMeshEnabled !== 'boolean' || !isWifiMeshEnabled
            }
            style={{
              opacity:
                typeof isWifiMeshEnabled !== 'boolean' || !isWifiMeshEnabled
                  ? 0.5
                  : undefined,
            }}
            left={props => <List.Icon {...props} icon="lan-connect" />}
            right={props => (
              <Switch
                {...props}
                value={isGatewayEnabled}
                disabled={
                  typeof isWifiMeshEnabled !== 'boolean' || !isWifiMeshEnabled
                }
                onValueChange={() => {
                  if (!isGatewayEnabled) {
                    setMeshNodeNumber(1);
                  }
                  setGatewayEnabled(!isGatewayEnabled);
                }}
              />
            )}
          />
        </View>
        <ListItemMenu
          disabled={!isWifiMeshEnabled || isGatewayEnabled}
          style={{
            opacity:
              typeof isWifiMeshEnabled !== 'boolean' || !isWifiMeshEnabled
                ? 0.5
                : undefined,
          }}
          icon="gamepad-circle-up"
          title="Nodnummer"
          description={selectedMeshNodeNumberOptions?.label}>
          {meshNodeNumberOptions.map(item => (
            <ListItemMenuItem
              key={item.value}
              title={item.label}
              onPress={() => {
                setMeshNodeNumber(item.value);
              }}
              disabled={item.disabled}
            />
          ))}
        </ListItemMenu>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => {
            fetchOrRefreshIPAddress();
            fetchOrRefreshMeshInterfaceCreated();
            fetchOrRefreshMAC();
            fetchOrRefresh();
          }}>
          Hämta/Uppdatera status nedan
        </Button>
        <Text
          style={{
            paddingTop: 20,
            opacity:
              typeof isWifiMeshEnabled !== 'boolean' || !isWifiMeshEnabled
                ? 0.5
                : undefined,
          }}>
          Mesh interface skapat:
        </Text>
        <Text
          style={{
            paddingTop: 10,
            opacity:
              typeof isWifiMeshEnabled !== 'boolean' ||
              !isWifiMeshEnabled ||
              meshInterfaceCreated == null
                ? 0
                : undefined,
          }}>
          {meshInterfaceCreated ? 'Ja' : 'Nej'}
        </Text>
        <Text
          style={{
            paddingTop: 20,
            opacity:
              typeof isWifiMeshEnabled !== 'boolean' || !isWifiMeshEnabled
                ? 0.5
                : undefined,
          }}>
          Mesh ipaddress:
        </Text>
        <Text
          style={{
            paddingTop: 10,
            opacity:
              typeof isWifiMeshEnabled !== 'boolean' ||
              !isWifiMeshEnabled ||
              meshIPAddress == null ||
              meshIPAddress === ''
                ? 0
                : undefined,
          }}>
          {meshIPAddress
            ?.replace('"', '')
            .replace('[', '')
            .replace(']', '')
            .replace('"', '')}
        </Text>
        <Text
          style={{
            paddingTop: 20,
            opacity:
              typeof isWifiMeshEnabled !== 'boolean' || !isWifiMeshEnabled
                ? 0.5
                : undefined,
          }}>
          Mesh MAC-adress:
        </Text>
        <Text
          style={{
            paddingTop: 10,
            opacity:
              typeof isWifiMeshEnabled !== 'boolean' ||
              !isWifiMeshEnabled ||
              meshMACAddress == null ||
              meshMACAddress === ''
                ? 0
                : undefined,
          }}>
          {meshMACAddress}
        </Text>
        <View style={styles.container}>
          <ScrollView
            horizontal={true}
            contentContainerStyle={{paddingBottom: 60}}>
            <View style={styles.tableContainer}>
              <DataTable style={(styles.table, {width: 500})}>
                <DataTable.Header style={styles.row}>
                  <DataTable.Title style={{flex: 5}}>Dest</DataTable.Title>
                  <DataTable.Title style={{flex: 5}}>Via</DataTable.Title>
                  <DataTable.Title style={{flex: 1}}>Hop</DataTable.Title>
                  <DataTable.Title style={{flex: 2}}>Quality</DataTable.Title>
                </DataTable.Header>
                <ScrollView>
                  {mpaths?.map(mpath => (
                    <DataTable.Row key={mpath.dest_addr} style={styles.row}>
                      <DataTable.Cell style={{flex: 5}}>
                        {mpath.dest_addr}
                      </DataTable.Cell>
                      <DataTable.Cell style={{flex: 5}}>
                        {mpath.dest_addr === mpath.next_hop
                          ? 'Direkt'
                          : mpath.next_hop}
                      </DataTable.Cell>
                      <DataTable.Cell style={{flex: 1}}>
                        {mpath.hop_count}
                      </DataTable.Cell>
                      <DataTable.Cell style={{flex: 2}}>
                        {mpath.metric}
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </ScrollView>
              </DataTable>
            </View>
          </ScrollView>
        </View>
      </View>
    </ScrollView>
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
  containerColumn: {
    flex: 1,
    flexDirection: 'column',
    paddingLeft: 10,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  table: {
    paddingRight: 0,
    marginRight: 0,
  },
  row: {
    paddingRight: 5,
    paddingLeft: 10,
  },
  scrollview: {
    flex: 1,
  },
  tableContainer: {
    flex: 1,
    height: '100%',
    paddingRight: 0,
    marginTop: 0,
  },
  button: {
    padding: 10,
    margin: 10,
    marginLeft: 0,
    marginRight: 0,
  },
});
