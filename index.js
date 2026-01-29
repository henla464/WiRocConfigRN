import {registerRootComponent} from 'expo';
import {QueryClientProvider} from '@tanstack/react-query';
import * as React from 'react';
import {MD3LightTheme as DefaultTheme, PaperProvider} from 'react-native-paper';
import {queryClient} from './queryClient';
import App from './src/app';
import './src/i18n';

global.Buffer = require('buffer').Buffer;

export default function Main() {
  return (
    <PaperProvider
      theme={{
        ...DefaultTheme,
      }}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </PaperProvider>
  );
}

registerRootComponent(Main);
