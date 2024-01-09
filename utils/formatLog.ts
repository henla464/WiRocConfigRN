import {Log} from '../types/log';

export const formatLog = (log: Log) => {
  return `${log.date.toISOString()} ${log.type.toUpperCase()} ${
    log.componentName
  }:${log.functionName}: ${log.message}`;
};
