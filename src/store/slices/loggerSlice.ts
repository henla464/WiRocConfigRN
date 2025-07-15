import {log} from '@lib/log';
import {ImmerStateCreator} from '../types';

export interface LoggerSliceState {
  logs: Log[];
}

export interface Log {
  id: string;
  type: LogType;
  date: Date;
  args: any[];
}

export type LogType = 'debug' | 'info' | 'warn' | 'error';

export const createLoggerSlice: ImmerStateCreator<LoggerSliceState> = set => {
  setInterval(() => {
    const logs = log.flushBuffer();
    set(state => {
      state.logs = [...state.logs, ...logs];
      state.logs = state.logs.slice(-500); // Keep only the last 500 logs
    });
  }, 5e3);

  return {
    logs: [],
  };
};
