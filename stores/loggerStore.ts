import {create} from 'zustand';
import {Log, LogType} from '../types/log';
import {formatLog} from '../utils/formatLog';

export interface LoggerStore {
  logs: Log[];
  createLogger: (type: LogType) => LogFunction;
}

type LogFunction = (
  componentName: string,
  functionName: string,
  message: string,
) => void;

export const useLoggerStore = create<LoggerStore>(set => ({
  logs: [],
  createLogger: (type: LogType) => {
    const logFunction: LogFunction = (componentName, functionName, message) => {
      const newLog: Log = {
        type,
        date: new Date(),
        componentName,
        functionName,
        message,
      };
      console.log(formatLog(newLog));
      set(state => ({
        logs: [...state.logs, newLog],
      }));
    };
    return logFunction;
  },
}));
