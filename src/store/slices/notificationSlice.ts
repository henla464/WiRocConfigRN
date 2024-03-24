import {ImmerStateCreator} from '../types';

export interface NotificationSliceState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: number) => void;
  removeAllNotifications: () => void;
}

interface Notification {
  id: number;
  type: 'error' | 'info';
  message: string;
}

let nextId = 0;

export const createNotificationSlice: ImmerStateCreator<
  NotificationSliceState
> = set => {
  return {
    notifications: [],
    addNotification: notification => {
      set(state => {
        state.notifications.push({
          ...notification,
          id: nextId++,
        });
      });
    },
    removeNotification: id => {
      set(state => {
        state.notifications = state.notifications.filter(
          notification => notification.id !== id,
        );
      });
    },
    removeAllNotifications: () => {
      set(state => {
        state.notifications = [];
      });
    },
  };
};
