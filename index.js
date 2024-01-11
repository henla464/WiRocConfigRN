/**
 * @format
 */

global.Buffer = require('buffer').Buffer;

import * as React from 'react';
import {AppRegistry} from 'react-native';
import {PaperProvider} from 'react-native-paper';
import App from './App';
import {name as appName} from './app.json';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function Main() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider
        theme={{
          button: {
            borderRadius: 0,
          },
        }}>
        <App />
      </PaperProvider>
    </QueryClientProvider>
  );
}

AppRegistry.registerComponent(appName, () => App);
