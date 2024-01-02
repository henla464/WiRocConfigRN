import React, {ReactElement, useRef, useState} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import ErrorBanner from './ErrorBanner';

interface ISectionComponent {
  Comp: React.JSX.Element;
  Name: String;
  SectionName: string;
  id: number;
  isDirty: boolean;
  childRef: React.RefObject<IRefRetType>;
}

export default function ConfigurationScreen(): ReactElement<React.FC> {
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const usbChildRef = useRef<IRefRetType>(null);
  const serialBluetoothRef = useRef<IRefRetType>(null);
  const SRRChildRef = useRef<IRefRetType>(null);
  const loraChildRef = useRef<IRefRetType>(null);
  const RS232ChildRef = useRef<IRefRetType>(null);
  const SIRAPChildRef = useRef<IRefRetType>(null);
  const [configurationComponents, setConfigurationComponents] = useState<
    ISectionComponent[]
  >([
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
    {
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
    },
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
  ]);

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

  function setIsDirtyOnComponent(id: number, isDirty2: boolean): void {
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

  return (
    <SafeAreaView style={Colors.lighter}>
      <ErrorBanner />
      <SaveBanner
        visible={isDirty}
        save={saveConfigurationScreen}
        reload={reloadConfigurationScreen}
      />
      <ScrollView>
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
