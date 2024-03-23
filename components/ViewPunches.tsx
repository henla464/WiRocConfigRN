import {useQuery, useQueryClient} from '@tanstack/react-query';
import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Button, DataTable} from 'react-native-paper';
import {Punch} from '../api/types';
import {useActiveWiRocDevice} from '../hooks/useActiveWiRocDevice';
import {useStore} from '../store';

export default function ViewPunches() {
  const deviceId = useActiveWiRocDevice();
  const apiBackend = useStore(state => state.wiRocDevices[deviceId].apiBackend);
  const [isListening, setIsListening] = useState<boolean>(false);

  const {data: punches = []} = useQuery<unknown, unknown, Punch[]>({
    queryKey: [deviceId, 'punches'],
    queryFn: async () => {
      // The device will stream punches to us.
      // Managed inside useReactQuerySubscription.
      return [];
    },
    staleTime: Infinity,
  });
  const queryClient = useQueryClient();

  const startStopViewPunches = async () => {
    if (isListening) {
      apiBackend.stopWatchingPunches();
      setIsListening(false);
    } else {
      apiBackend.startWatchingPunches();
      setIsListening(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerRow}>
        <Button
          icon=""
          loading={isListening}
          mode="contained"
          onPress={startStopViewPunches}
          style={[styles.button, {flex: 1, marginRight: 0}]}>
          {isListening ? 'Sluta visa stämplingar' : 'Visa stämplingar'}
        </Button>
      </View>
      <View style={styles.containerRow}>
        <Button
          icon=""
          mode="contained"
          onPress={() => {
            queryClient.setQueryData([deviceId, 'punches'], []);
          }}
          style={[styles.button, {flex: 1, marginRight: 0}]}>
          Rensa
        </Button>
      </View>
      <View style={styles.tableContainer}>
        <DataTable style={styles.table}>
          <DataTable.Header style={styles.row}>
            <DataTable.Title>Kontrollnummer</DataTable.Title>
            <DataTable.Title>SI-nummer</DataTable.Title>
            <DataTable.Title>Tid</DataTable.Title>
          </DataTable.Header>
          <ScrollView>
            {punches.map((punch, idx) => (
              <DataTable.Row key={idx} style={styles.row}>
                <DataTable.Cell>{punch.StationNumber}</DataTable.Cell>
                <DataTable.Cell>{punch.SICardNumber}</DataTable.Cell>
                <DataTable.Cell>{punch.Time}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </ScrollView>
        </DataTable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    paddingRight: 0,
    marginRight: 0,
  },
  row: {
    paddingRight: 5,
    paddingLeft: 10,
  },
  tableContainer: {
    paddingRight: 0,
    marginTop: 0,
    backgroundColor: 'lightgray',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingLeft: 5,
    paddingTop: 0,
    paddingRight: 5,
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
    paddingBottom: 0,
    backgroundColor: 'lightgray',
  },
  button: {
    padding: 10,
    margin: 10,
    marginLeft: 0,
  },
});
