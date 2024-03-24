import {Log} from '@store/slices/loggerSlice';

export const formatLog = (log: Log) => {
  return `${log.date.toISOString()} ${log.type.toUpperCase()} ${
    log.componentName
  }:${log.functionName}: ${log.message}`;
};
