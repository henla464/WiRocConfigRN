import {useStore} from '@store';

export const useNotify = () => {
  return useStore(state => state.addNotification);
};
