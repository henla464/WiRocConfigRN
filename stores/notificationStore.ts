import {create} from 'zustand';
import {immer} from 'zustand/middleware/immer';

export interface NotificationStore {
  notifications: Notification[];
  notify: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: number) => void;
  removeAllNotifications: () => void;
}

interface Notification {
  id: number;
  type: 'error' | 'info';
  message: string;
}

let nextId = 0;

export const useNotificationStore = create<NotificationStore>()(
  immer(set => ({
    notifications: [],
    notify: notification => {
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
  })),
);
