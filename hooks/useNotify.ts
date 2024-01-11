import {useNotificationStore} from '../stores/notificationStore';

export const useNotify = () => {
  return useNotificationStore(state => state.notify);
};
