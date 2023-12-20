import React, {ReactElement, useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {Divider, List} from 'react-native-paper';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import SIRAP from './SIRAP';
import RS232 from './RS232';
import USB from './USB';
import SerialBluetooth from './SerialBluetooth';
import LoraRadio from './LoraRadio';
import SRR from './SRR';
import IConfigComponentProps from '../interface/IConfigComponentProps';

interface ISectionComponent {
  Comp: React.JSX.Element;
  SectionName: string;
  id: number;
  isDirty: boolean;
}

export default function ConfigurationScreen(): ReactElement<React.FC> {
  //let s = SerialBluetooth({id: 2});
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [configurationComponents, setConfigurationComponents] = useState<
    ISectionComponent[]
  >([
    {
      Comp: <USB id={1} setIsDirtyFunction={setIsDirtyOnComponent} key={1} />,
      SectionName: 'Input',
      id: 1,
      isDirty: false,
    },
    {
      Comp: (
        <SerialBluetooth
          id={2}
          setIsDirtyFunction={setIsDirtyOnComponent}
          key={2}
        />
      ),
      SectionName: 'Input',
      id: 2,
      isDirty: false,
    },
    {
      Comp: <SRR id={3} setIsDirtyFunction={setIsDirtyOnComponent} key={3} />,
      SectionName: 'Input',
      id: 3,
      isDirty: false,
    },
    {
      Comp: (
        <LoraRadio id={4} setIsDirtyFunction={setIsDirtyOnComponent} key={4} />
      ),
      SectionName: 'InputOutput',
      id: 4,
      isDirty: false,
    },
    {
      Comp: <RS232 id={5} setIsDirtyFunction={setIsDirtyOnComponent} key={5} />,
      SectionName: 'InputOutput',
      id: 5,
      isDirty: false,
    },
    {
      Comp: <SIRAP id={6} setIsDirtyFunction={setIsDirtyOnComponent} key={6} />,
      SectionName: 'Output',
      id: 6,
      isDirty: false,
    },
  ]);

  function setIsDirtyOnComponent(id: number, isDirty2: boolean): void {
    console.log('setIsDirtyOnComponent: ' + id + ' isDirty: ' + isDirty2);
    let newCompArray = [...configurationComponents];
    let theComp = newCompArray.find(comp => {
      comp.id === id;
    });
    if (theComp) {
      theComp.isDirty = isDirty2;
    }
    setConfigurationComponents(newCompArray);
    setIsDirty(isDirty2);
  }

  return (
    <SafeAreaView style={Colors.lighter}>
      <ScrollView>
        <List.AccordionGroup>
          <View>
            <Text>{isDirty ? 'IS DIRTY' : 'NOT DIRTY'}</Text>
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
