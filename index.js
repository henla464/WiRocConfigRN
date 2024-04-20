import {QueryClientProvider} from '@tanstack/react-query';
import * as React from 'react';
import {AppRegistry} from 'react-native';
import {MD3LightTheme as DefaultTheme, PaperProvider} from 'react-native-paper';

import {name as appName} from './app.json';
import {queryClient} from './queryClient';
import App from './src/app';

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

AppRegistry.registerComponent(appName, () => Main);
