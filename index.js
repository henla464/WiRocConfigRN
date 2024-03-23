/**
 * @format
 */

global.Buffer = require('buffer').Buffer;

import * as React from 'react';
import {AppRegistry} from 'react-native';
import {PaperProvider, MD3LightTheme as DefaultTheme} from 'react-native-paper';
import App from './App';
import {name as appName} from './app.json';
import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from './queryClient';

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
