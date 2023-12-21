import React, {useImperativeHandle, useState} from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {
  Button,
  Checkbox,
  Chip,
  DataTable,
  Icon,
  List,
} from 'react-native-paper';
import IConfigComponentProps from '../interface/IConfigComponentProps';
import OnOffChip from './OnOffChip';
import IRefRetType from '../interface/IRefRetType';

const SerialBluetooth = React.forwardRef<IRefRetType, IConfigComponentProps>(
  (compProps: IConfigComponentProps, ref: React.ForwardedRef<IRefRetType>) => {
    const [isBTDeviceConfigured, setIsBTDeviceConfigured] =
      useState<boolean>(false);
    const [isOneWay, setIsOneWay] = useState<boolean>(false);
    const [items, setItems] = useState([
      {
        key: 1,
        name: 'Cupcake',
        calories: 356,
        fat: 16,
      },
      {
        key: 2,
        name: 'Eclair',
        calories: 262,
        fat: 16,
      },
      {
        key: 3,
        name: 'Frozen yogurt',
        calories: 159,
        fat: 6,
      },
      {
        key: 4,
        name: 'Gingerbread',
        calories: 305,
        fat: 3.7,
      },
    ]);

    useImperativeHandle(ref, () => {
      return {
        save: () => {
          save();
        },
      };
    });

    const save = () => {
      null;
    };

    compProps.registerSaveFunction(compProps.id, save);

    const chipBackgroundColor = isBTDeviceConfigured ? 'green' : 'red';

    return (
      <List.Accordion
        title="Seriell Bluetooth"
        id={compProps.id}
        right={({isExpanded}) => (
          <View style={styles.accordionHeader}>
            <OnOffChip on={isBTDeviceConfigured} />
            {isExpanded ? (
              <Icon source="chevron-up" size={25} />
            ) : (
              <Icon source="chevron-down" size={25} />
            )}
          </View>
        )}>
        <View style={styles.container}>
          <View style={styles.mainCheckBoxContainer}>
            <Checkbox.Item
              label="Envägs, lyssna passivt"
              position="leading"
              status={isOneWay ? 'checked' : 'unchecked'}
              onPress={() => {
                setIsOneWay(!isOneWay);
              }}
              labelStyle={styles.checkBoxLabel}
            />
          </View>
        </View>
        <View style={styles.tableContainer}>
          <DataTable style={styles.table}>
            <DataTable.Header style={styles.row}>
              <DataTable.Title>Namn</DataTable.Title>
              <DataTable.Title>BT adress/Status</DataTable.Title>
              <DataTable.Title style={styles.buttonColumnCell}>
                <View>
                  <Text> </Text>
                </View>
              </DataTable.Title>
            </DataTable.Header>

            {items.map(item => (
              <DataTable.Row key={item.key} style={styles.row}>
                <DataTable.Cell>{item.name}</DataTable.Cell>
                <View style={styles.btAddressCell}>
                  <Text numberOfLines={2} ellipsizeMode="tail">
                    asdfasdfasfafd\nasdfasdf a sdfaksdjfa sdkfj sakdfkasjdf
                  </Text>
                </View>
                <DataTable.Cell style={styles.buttonCell} numeric>
                  <Button
                    icon=""
                    loading={false}
                    mode="contained"
                    onPress={() => null}
                    style={styles.button}>
                    Anslut
                  </Button>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </View>
      </List.Accordion>
    );
  },
);

export default SerialBluetooth;

const styles = StyleSheet.create({
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  table: {
    paddingRight: 0,
    marginRight: 0,
  },
  row: {
    paddingRight: 5,
    paddingLeft: 10,
  },
  buttonColumnCell: {
    flex: 0,
    width: 93,
  },
  buttonCell: {
    flex: 0,
  },
  tableContainer: {
    paddingRight: 0,
    marginTop: 0,
    backgroundColor: 'lightgray',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 18,
    paddingTop: 1,
    paddingRight: 10,
    paddingBottom: 0,
    backgroundColor: 'lightgray',
  },
  mainCheckBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    margin: 0,
  },
  checkBoxLabel: {
    marginLeft: 5,
  },
  btAddressCell: {
    width: 150,
  },
  button: {
    padding: 1,
    margin: 1,
  },
});
