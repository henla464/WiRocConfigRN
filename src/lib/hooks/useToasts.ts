import {useStore} from '@store';

export function useToasts() {
  const addToast = useStore(state => state.addToast);
  return {addToast};
}
