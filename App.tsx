import React from 'react';
import 'react-native-gesture-handler';
import {
  DrawerNavigationState,
  NavigationContainer,
  ParamListBase,
} from '@react-navigation/native';
import {View, StyleSheet, Image} from 'react-native';
import {
  createDrawerNavigator,
  DrawerItem,
  DrawerContentScrollView,
} from '@react-navigation/drawer';

import ScanForDevicesScreen from './components/ScanForDevicesScreen';
import {Caption, Drawer, Text, TouchableRipple} from 'react-native-paper';
import DeviceBottomNavigation from './components/DeviceBottomNavigation';
import {
  DrawerDescriptorMap,
  DrawerNavigationHelpers,
} from '@react-navigation/drawer/lib/typescript/src/types';
import AboutScreen from './components/AboutScreen';
import NavigationHeader from './components/NavigationHeader';

const Drawer2 = createDrawerNavigator();

interface DrawerContentProps {
  state: DrawerNavigationState<ParamListBase>;
  navigation: DrawerNavigationHelpers;
  descriptors: DrawerDescriptorMap;
}

//ScrollViewProps
export function DrawerContent(props: DrawerContentProps) {
  return (
    <DrawerContentScrollView>
      <View style={styles.drawerContent}>
        <View style={styles.logo}>
          <Image
            source={require('./images/logotransparent.png')}
            style={{width: 142, height: 68}}
          />
        </View>
        <Drawer.Section style={styles.drawerSection}>
          <DrawerItem
            label="Sök WiRoc enheter"
            onPress={() => {
              props.navigation.navigate('ScanForDevices');
            }}
          />
          <DrawerItem
            label="Om"
            onPress={() => {
              props.navigation.navigate('About');
            }}
          />
        </Drawer.Section>
        <Drawer.Section title="WiRoc enheter">
          <TouchableRipple
            onPress={() => {
              props.navigation.navigate('Device');
            }}>
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
        initialRouteName="ScanForDevices"
        drawerContent={props => <DrawerContent {...props} />}>
        <Drawer2.Screen
          name="ScanForDevices"
          component={ScanForDevicesScreen}
          options={{
            title: 'Sök WiRoc enheter',
            headerRight: () => <NavigationHeader />,
          }}
        />
        <Drawer2.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: 'Om',
            headerRight: () => <NavigationHeader />,
          }}
        />
        <Drawer2.Screen
          name="Device"
          component={DeviceBottomNavigation}
          options={{
            title: 'WiRoc enhet',
            headerRight: () => <NavigationHeader />,
          }}
        />
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
