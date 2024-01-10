export interface Log {
  type: LogType;
  date: Date;
  componentName: string;
  functionName: string;
  message: string;
}

export type LogType = 'debug' | 'info' | 'error';
