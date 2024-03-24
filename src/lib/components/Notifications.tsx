import React from 'react';
import {Banner, useTheme} from 'react-native-paper';

import {useStore} from '@store';

export const Notifications = () => {
  const notifications = useStore(state => state.notifications);
  const removeNotification = useStore(state => state.removeNotification);
  const removeAllNotifications = useStore(
    state => state.removeAllNotifications,
  );
  const theme = useTheme();

  const currentNotification = notifications[0];

  const actions = [
    {
      label: notifications.length > 1 ? 'Nästa' : 'Stäng',
      onPress: () => {
        if (notifications.length > 0) {
          removeNotification(currentNotification.id);
        }
      },
    },
  ];

  if (notifications.length > 1) {
    actions.unshift({
      label: `Stäng ${notifications.length} meddelanden`,
      onPress: () => {
        removeAllNotifications();
      },
    });
  }

  return (
    <Banner
      visible={currentNotification !== undefined}
      actions={actions}
      icon={
        {
          error: 'alert',
          info: 'information-outline',
        }[currentNotification?.type]
      }
      style={{
        backgroundColor: {
          error: theme.colors.errorContainer,
          info: theme.colors.primaryContainer,
        }[currentNotification?.type],
      }}>
      {currentNotification?.message}
    </Banner>
  );
};
