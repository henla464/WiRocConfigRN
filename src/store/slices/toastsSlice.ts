import {ImmerStateCreator} from '../types';

export interface ToastsSliceState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => number;
  dismissToast: (id: number) => void;
  dismissedToasts: Record<number, boolean>;
}

export interface Toast {
  id: number;
  message: string;
  duration?: number;
  onDismiss?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

let nextId = 0;

export const createToastsSlice: ImmerStateCreator<ToastsSliceState> = set => {
  return {
    toasts: [],
    dismissedToasts: {},
    dismissToast: id => {
      set(state => {
        state.dismissedToasts[id] = true;
      });
      setTimeout(() => {
        set(state => {
          state.toasts = state.toasts.filter(toast => toast.id !== id);
          delete state.dismissedToasts[id];
        });
      }, 1000);
    },
    addToast: toast => {
      const id = nextId++;
      set(state => {
        state.toasts.push({
          ...toast,
          id,
        });
      });
      return id;
    },
  };
};
