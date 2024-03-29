import React from 'react';
import {Portal, Snackbar} from 'react-native-paper';

import {useStore} from '@store';

interface ToastsProps {
  offset?: number;
}

export function Toasts({offset = 0}: ToastsProps) {
  const toasts = useStore(state => state.toasts);
  return (
    <Portal>
      {toasts.map(toast => (
        <Toast key={toast.id} id={toast.id} offset={offset} />
      ))}
    </Portal>
  );
}

interface ToastProps {
  id: number;
  offset?: number;
}

function Toast({id, offset}: ToastProps) {
  const toast = useStore(state => state.toasts.find(t => t.id === id));
  const dismissToast = useStore(state => state.dismissToast);
  const dismissedToasts = useStore(state => state.dismissedToasts);

  if (!toast) {
    return null;
  }

  return (
    <Snackbar
      key={toast.id}
      visible={!dismissedToasts[toast.id]}
      onDismiss={toast.onDismiss ?? (() => dismissToast(toast.id))}
      style={{
        bottom: offset,
      }}
      action={
        toast.action ?? {
          label: 'OK',
          onPress: () => dismissToast(toast.id),
        }
      }
      duration={toast.duration ?? 4000}>
      {toast.message}
    </Snackbar>
  );
}
