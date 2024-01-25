import {useStore} from '../store';
import {Log, LogType} from '../store/slices/loggerSlice';
import {formatLog} from '../utils/formatLog';

type LogFunction = (
  componentName: string,
  functionName: string,
  message: string,
) => void;

const createLogger = (type: LogType) => {
  const logFunction: LogFunction = (componentName, functionName, message) => {
    const newLog: Log = {
      type,
      date: new Date(),
      componentName,
      functionName,
      message,
    };
    console[type](formatLog(newLog));
    useStore.setState(state => {
      state.logs.push(newLog);
    });
  };
  return logFunction;
};

export const logger = {
  info: createLogger('info'),
  debug: createLogger('debug'),
  error: createLogger('error'),
};

export const useLogger = () => {
  return logger;
};
