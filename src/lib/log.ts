import {useStore} from '@store';
import {Log} from '@store/slices/loggerSlice';

let logBuffer: Log[] = [];

setInterval(() => {
  // Flush logs to the log store every N seconds.
  if (logBuffer.length === 0) {
    return;
  }
  useStore.setState(current => {
    logBuffer.forEach(log => current.logs.push(log));
    logBuffer = [];

    // Keep only the last 500 logs.
    current.logs = current.logs.slice(-500);
  });
}, 5e3);

let logId = 0;

function doLog(method: 'debug' | 'info' | 'warn' | 'error', ...args: any[]) {
  console[method](...args);
  logBuffer.push({
    id: String(logId++),
    type: method,
    date: new Date(),
    args,
  });
}

export const log = {
  debug: doLog.bind(undefined, 'debug'),
  info: doLog.bind(undefined, 'info'),
  warn: doLog.bind(undefined, 'warn'),
  error: doLog.bind(undefined, 'error'),
};
