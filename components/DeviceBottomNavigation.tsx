import * as React from 'react';
import {useState} from 'react';
import {BottomNavigation, Text} from 'react-native-paper';

const MusicRoute = () => <Text>Music</Text>;

const AlbumsRoute = () => <Text>Albums</Text>;

const RecentsRoute = () => <Text>Recents</Text>;

const NotificationsRoute = () => <Text>Notifications</Text>;

export default function DeviceBottomNavigation() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {
      key: 'music',
      title: 'Konfiguration',
      focusedIcon: 'router-wireless-settings',
    },
    {key: 'albums', title: 'Test', focusedIcon: 'list-status'},
    {key: 'recents', title: 'Övrigt', focusedIcon: 'ampersand'},
  ]);

  const renderScene = BottomNavigation.SceneMap({
    music: MusicRoute,
    albums: AlbumsRoute,
    recents: RecentsRoute,
    notifications: NotificationsRoute,
  });

  return (
    <BottomNavigation
      navigationState={{index, routes}}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}
