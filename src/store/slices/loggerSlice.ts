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

export const createLoggerSlice: ImmerStateCreator<LoggerSliceState> = () => {
  return {
    logs: [],
  };
};
