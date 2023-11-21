import React from 'react';
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {View, StyleSheet, ScrollViewProps, Image} from 'react-native';
import {
  createDrawerNavigator,
  DrawerItem,
  DrawerContentScrollView,
} from '@react-navigation/drawer';

//import {createStackNavigator} from '@react-navigation/stack';

import ScanForDevicesScreen from './components/ScanForDevicesScreen';
import {Caption, Drawer, Text, TouchableRipple} from 'react-native-paper';

const Drawer2 = createDrawerNavigator();

export function DrawerContent(props: ScrollViewProps) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerContent}>
        <View style={styles.logo}>
          <Image
            source={require('./images/logotransparent.png')}
            style={{width: 142, height: 68}}
          />
        </View>
        <Drawer.Section style={styles.drawerSection}>
          <DrawerItem label="Sök WiRoc enheter" onPress={() => {}} />
          <DrawerItem label="Om" onPress={() => {}} />
        </Drawer.Section>
        <Drawer.Section title="WiRoc enheter">
          <TouchableRipple onPress={() => {}}>
            <View style={styles.foundDevices}>
              <Text>102</Text>
              <Caption style={styles.caption}>12:54:AC:45:EF:32</Caption>
            </View>
          </TouchableRipple>
          <TouchableRipple onPress={() => {}}>
            <View style={styles.foundDevices}>
              <Text>250</Text>
              <Caption style={styles.caption}>22:54:AC:45:EF:43</Caption>
            </View>
          </TouchableRipple>
        </Drawer.Section>
      </View>
    </DrawerContentScrollView>
  );
}

function App(): JSX.Element {
  return (
    <NavigationContainer>
      <Drawer2.Navigator
        initialRouteName="Sök WiRoc enheter"
        drawerContent={() => <DrawerContent />}>
        <Drawer2.Screen
          name="Sök WiRoc enheter"
          component={ScanForDevicesScreen}
        />
        <Drawer2.Screen name="Details" component={ScanForDevicesScreen} />
      </Drawer2.Navigator>
    </NavigationContainer>
  );
}

export default App;

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  title: {
    marginTop: 20,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  logo: {
    alignItems: 'center',
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  foundDevices: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
