import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button, Icon, List, TextInput} from 'react-native-paper';
import ConnectedChip from './ConnectedChip';

interface IWifiItem {
  networkName: string;
  isConnected: boolean;
  signalStrength: number;
  wifiConnect: (args: {networkName: string; password: string}) => void;
  wifiDisconnect: (networkName: string) => void;
}

const WifiItem = ({
  networkName,
  isConnected,
  signalStrength,
  wifiConnect,
  wifiDisconnect,
}: IWifiItem) => {
  const [hidePass, setHidePass] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');

  return (
    <List.Accordion
      style={styles.accordion}
      title={networkName}
      id={networkName}
      key={networkName}
      right={({isExpanded}) => (
        <View style={styles.accordionHeader}>
          <ConnectedChip connected={isConnected} />
          {isExpanded ? (
            <Icon source="chevron-up" size={25} />
          ) : (
            <Icon source="chevron-down" size={25} />
          )}
        </View>
      )}>
      <View style={styles.accordionContent}>
        <Text>Signalstyrka: {signalStrength}</Text>
        {!isConnected ? (
          <TextInput
            value={password}
            style={styles.textInput}
            label="Password"
            secureTextEntry={hidePass}
            onChangeText={(text: string) => {
              setPassword(text);
            }}
            right={
              <TextInput.Icon
                icon="eye"
                onPress={() => setHidePass(!hidePass)}
              />
            }
          />
        ) : null}

        <View style={styles.buttonView}>
          <Button
            loading={false}
            icon=""
            mode="contained"
            style={styles.button}
            onPress={() => {
              isConnected
                ? wifiDisconnect(networkName)
                : wifiConnect({networkName, password});
            }}>
            {isConnected ? 'Koppla från' : 'Anslut'}
          </Button>
        </View>
      </View>
    </List.Accordion>
  );
};

export default WifiItem;

const styles = StyleSheet.create({
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingTop: 1,
    paddingRight: 10,
    paddingBottom: 1,
    backgroundColor: 'lightgray',
  },
  containerColumn: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 18,
    paddingTop: 1,
    paddingRight: 10,
    paddingBottom: 1,
    backgroundColor: 'lightgray',
  },
  accordion: {
    //backgroundColor: 'yellow',
  },
  accordionContent: {
    backgroundColor: 'lightgray',
    padding: 20,
  },
  buttonView: {
    alignItems: 'flex-end',
  },
  textInput: {
    margin: 10,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
});
