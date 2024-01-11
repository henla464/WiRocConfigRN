import {ImmerStateCreator} from '../types';

export interface LoggerSliceState {
  logs: Log[];
}

export interface Log {
  type: LogType;
  date: Date;
  componentName: string;
  functionName: string;
  message: string;
}

export type LogType = 'debug' | 'info' | 'error';

export const createLoggerSlice: ImmerStateCreator<LoggerSliceState> = () => {
  return {
    logs: [],
  };
};
