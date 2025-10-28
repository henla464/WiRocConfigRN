import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {CommonActions} from '@react-navigation/native';
import {BottomNavigation, TouchableRipple} from 'react-native-paper';

/**
 * From react-native-paper documentation:
 *
 * The createMaterialBottomTabNavigator has been deprecated as of
 * react-native-paper@5.14.0. Instead, use @react-navigation/bottom-tabs
 * version 7.x or later, combined with BottomNavigation.Bar to achieve a
 * Material Design look.
 *
 * For implementation details, see the dedicated example.
 * https://callstack.github.io/react-native-paper/docs/components/BottomNavigation/BottomNavigationBar#with-react-navigation
 */
export function MaterialBottomNavigationTabBar({
  navigation,
  state,
  descriptors,
  insets,
}: BottomTabBarProps) {
  return (
    <BottomNavigation.Bar
      navigationState={state}
      safeAreaInsets={insets}
      onTabPress={({route, preventDefault}) => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (event.defaultPrevented) {
          preventDefault();
        } else {
          navigation.dispatch({
            ...CommonActions.navigate(route.name, route.params),
            target: state.key,
          });
        }
      }}
      renderIcon={({route, focused, color}) =>
        descriptors[route.key].options.tabBarIcon?.({
          focused,
          color,
          size: 24,
        }) || null
      }
      renderTouchable={({key, ...props}) => (
        <TouchableRipple key={key} {...props} />
      )}
      getLabelText={({route}) => {
        const {options} = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : typeof options.title === 'string'
              ? options.title
              : route.name;

        return label;
      }}
    />
  );
}
