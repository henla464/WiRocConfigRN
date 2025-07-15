import type {Log} from '@store/slices/loggerSlice';

let logBuffer: Log[] = [];
let logId = 0;

function doLog(method: 'debug' | 'info' | 'warn' | 'error', ...args: any[]) {
  console[method](...args);
  logBuffer.push({
    id: String(logId++),
    type: method,
    date: new Date(),
    args,
  });
  logBuffer = logBuffer.slice(-500); // Keep only the last 500 logs
}

export const log = {
  debug: doLog.bind(undefined, 'debug'),
  info: doLog.bind(undefined, 'info'),
  warn: doLog.bind(undefined, 'warn'),
  error: doLog.bind(undefined, 'error'),
  flushBuffer: () => {
    const logs = [...logBuffer];
    logBuffer = [];
    return logs;
  },
};
