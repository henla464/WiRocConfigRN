import React, {ReactElement, useEffect, useRef, useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Divider, List} from 'react-native-paper';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import SIRAP from './SIRAP';
import RS232 from './RS232';
import USB from './USB';
import SerialBluetooth from './SerialBluetooth';
import LoraRadio from './LoraRadio';
import SRR from './SRR';
import IRefRetType from '../interface/IRefRetType';
import SaveBanner from './SaveBanner';
import {useNavigation} from '@react-navigation/native';
import {useBLEApiContext} from '../context/BLEApiContext';
import {Notifications} from './Notifications';

interface ISectionComponent {
  Comp: React.JSX.Element;
  Name: String;
  SectionName: string;
  id: number;
  isDirty: boolean;
  childRef: React.RefObject<IRefRetType>;
}

export default function ConfigurationScreen(): ReactElement<React.FC> {
  const BLEAPI = useBLEApiContext();
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const usbChildRef = useRef<IRefRetType>(null);
  const serialBluetoothRef = useRef<IRefRetType>(null);
  const SRRChildRef = useRef<IRefRetType>(null);
  const loraChildRef = useRef<IRefRetType>(null);
  const RS232ChildRef = useRef<IRefRetType>(null);
  const SIRAPChildRef = useRef<IRefRetType>(null);
  const [hasSRR, setHasSRR] = useState<boolean>(false);
  const navigation = useNavigation();
  const [configurationComponents, setConfigurationComponents] = useState<
    ISectionComponent[]
  >([]);

  const [scrollViewRef, setScrollViewRef] = useState<ScrollView | null>(null);

  useEffect(() => {
    if (BLEAPI.connectedDevice !== null) {
      let pc = BLEAPI.requestProperty(
        BLEAPI.connectedDevice,
        'ConfigurationScreen',
        'hashw/srr',
        (propName: string, propValue: string) => {
          if (propName === 'hashw/srr') {
            setHasSRR(parseInt(propValue, 10) !== 0);
          }
        },
      );
    }
  }, [BLEAPI]);

  /*const setIsDirtyOnComponent = useCallback(
    (id: number, isDirty2: boolean): void => {
      console.log('setIsDirtyOnComponent: ' + id + ' isDirty: ' + isDirty2);
      let newCompArray = [...configurationComponents];
      let theCompIndex = newCompArray.findIndex(comp => {
        return comp.id === id;
      });
      if (theCompIndex >= 0) {
        newCompArray[theCompIndex].isDirty = isDirty2;
      }
      setConfigurationComponents(newCompArray);
      let firstIsDirtyCompIndex = newCompArray.findIndex(comp => {
        return comp.isDirty;
      });

      if (firstIsDirtyCompIndex >= 0) {
        setIsDirty(true);
      } else {
        setIsDirty(false);
      }
    },
    [configurationComponents],
  );*/

  useEffect(() => {
    const setIsDirtyOnComponent = (id: number, isDirty2: boolean): void => {
      console.log('setIsDirtyOnComponent: ' + id + ' isDirty: ' + isDirty2);
      setConfigurationComponents(prevComponents => {
        let newCompArray = [...prevComponents];
        let theCompIndex = newCompArray.findIndex(comp => {
          return comp.id === id;
        });
        if (theCompIndex >= 0) {
          newCompArray[theCompIndex].isDirty = isDirty2;
        }

        let firstIsDirtyCompIndex = newCompArray.findIndex(comp => {
          return comp.isDirty;
        });

        if (firstIsDirtyCompIndex >= 0) {
          setIsDirty(true);
        } else {
          setIsDirty(false);
        }

        return newCompArray;
      });
    };

    let configComps: ISectionComponent[] = [
      {
        Comp: (
          <USB
            id={1}
            setIsDirtyFunction={setIsDirtyOnComponent}
            key={1}
            ref={usbChildRef}
          />
        ),
        Name: 'USB',
        SectionName: 'Input',
        id: 1,
        isDirty: false,
        childRef: usbChildRef,
      },
      {
        Comp: (
          <SerialBluetooth
            id={2}
            setIsDirtyFunction={setIsDirtyOnComponent}
            key={2}
            ref={serialBluetoothRef}
          />
        ),
        Name: 'SerialBluetooth',
        SectionName: 'Input',
        id: 2,
        isDirty: false,
        childRef: serialBluetoothRef,
      },
    ];

    if (hasSRR) {
      configComps.push({
        Comp: (
          <SRR
            id={3}
            setIsDirtyFunction={setIsDirtyOnComponent}
            key={3}
            ref={SRRChildRef}
          />
        ),
        Name: 'SRR',
        SectionName: 'Input',
        id: 3,
        isDirty: false,
        childRef: SRRChildRef,
      });
    }

    configComps.push(
      {
        Comp: (
          <LoraRadio
            id={4}
            setIsDirtyFunction={setIsDirtyOnComponent}
            key={4}
            ref={loraChildRef}
          />
        ),
        Name: 'LoraRadio',
        SectionName: 'InputOutput',
        id: 4,
        isDirty: false,
        childRef: loraChildRef,
      },
      {
        Comp: (
          <RS232
            id={5}
            setIsDirtyFunction={setIsDirtyOnComponent}
            key={5}
            ref={RS232ChildRef}
          />
        ),
        Name: 'RS232',
        SectionName: 'InputOutput',
        id: 5,
        isDirty: false,
        childRef: RS232ChildRef,
      },
      {
        Comp: (
          <SIRAP
            id={6}
            setIsDirtyFunction={setIsDirtyOnComponent}
            key={6}
            ref={SIRAPChildRef}
          />
        ),
        Name: 'SIRAP',
        SectionName: 'Output',
        id: 6,
        isDirty: false,
        childRef: SIRAPChildRef,
      },
    );

    setConfigurationComponents(configComps);
  }, [hasSRR]);

  function saveConfigurationScreen() {
    configurationComponents.forEach(sectionComp => {
      if (sectionComp.isDirty) {
        console.log(
          'ConfigurationScreen:saveConfigurationScreen ' +
            sectionComp.Name +
            ' Is dirty -> Save it',
        );
        if (sectionComp.childRef && sectionComp.childRef.current) {
          sectionComp.childRef.current.save();
        } else {
          console.log(
            'ConfigurationScreen:saveConfigurationScreen: childRef not set',
          );
        }
      }
    });
    reloadConfigurationScreen();
  }

  const reloadConfigurationScreen = () => {
    configurationComponents.forEach(sectionComp => {
      if (sectionComp.isDirty) {
        console.log(
          'ConfigurationScreen:reloadConfigurationScreen: ' +
            sectionComp.Name +
            ' Is dirty -> reload it',
        );
        if (sectionComp.childRef && sectionComp.childRef.current) {
          sectionComp.childRef.current.reload();
        } else {
          console.log(
            'ConfigurationScreen:reloadConfigurationScreen: childRef not set',
          );
        }
      }
    });
  };

  useEffect(() => {
    if (BLEAPI.connectedDevice === null) {
      if (navigation.isFocused()) {
        let screenName =
          navigation.getState().routes[navigation.getState().index].name;
        console.log(
          'ConfigurationScreen:useEffect navigate to ScanForDevices, current screen: ' +
            screenName +
            ' isFocused: ' +
            navigation.isFocused(),
        );

        navigation.navigate('ScanForDevices');
      }
    }
  }, [BLEAPI, navigation]);

  const [mTop, setMTop] = useState(0);
  const [currentScrollPosition, setCurrentScrollPosition] = useState(0);
  /*
  useEffect(() => {
    if (isDirty) {
      setMTop(130);
      scrollViewRef?.scrollTo({x: 0, y: 130, animated: false});
    } else {
      setMTop(0);
      scrollViewRef?.scrollTo({x: 0, y: 0, animated: false});
    }
    console.log('hej hej');
  }, [isDirty, scrollViewRef]);
*/
  return (
    <SafeAreaView style={Colors.lighter}>
      <Notifications />
      <SaveBanner
        visible={isDirty}
        save={saveConfigurationScreen}
        reload={reloadConfigurationScreen}
        onHideAnimationFinished={() => {
          setMTop(0);
          scrollViewRef?.scrollTo({
            x: 0,
            y: currentScrollPosition - 133,
            animated: false,
          });
        }}
        onShowAnimationFinished={() => {
          setMTop(133);
          scrollViewRef?.scrollTo({
            x: 0,
            y: currentScrollPosition + 133,
            animated: false,
          });
        }}
      />
      <ScrollView
        ref={ref => {
          setScrollViewRef(ref);
        }}
        onScroll={e => {
          setCurrentScrollPosition(e.nativeEvent.contentOffset.y);
        }}
        style={{marginTop: mTop}}>
        <List.AccordionGroup>
          <View>
            <Divider bold={true} />
            <Text style={styles.header}>Indata</Text>
            <Divider bold={true} />
            {configurationComponents.map((c: ISectionComponent) => {
              if (c.SectionName === 'Input') {
                return c.Comp;
              }
            })}
          </View>
          <View>
            <Divider bold={true} />
            <Text style={styles.header}>In- och utdata</Text>
            <Divider bold={true} />
            {configurationComponents.map((c: ISectionComponent) => {
              if (c.SectionName === 'InputOutput') {
                return c.Comp;
              }
            })}
          </View>
          <View>
            <Divider bold={true} />
            <Text style={styles.header}>Utdata</Text>
            <Divider bold={true} />
            {configurationComponents.map((c: ISectionComponent) => {
              if (c.SectionName === 'Output') {
                return c.Comp;
              }
            })}
          </View>
        </List.AccordionGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 10,
    fontWeight: 'bold',
    fontSize: 20,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
