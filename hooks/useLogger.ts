import {useMemo} from 'react';
import {useLoggerStore} from '../stores/loggerStore';

export const useLogger = () => {
  const createLogger = useLoggerStore(state => state.createLogger);
  return useMemo(
    () => ({
      debug: createLogger('debug'),
      info: createLogger('info'),
      error: createLogger('error'),
    }),
    [createLogger],
  );
};
