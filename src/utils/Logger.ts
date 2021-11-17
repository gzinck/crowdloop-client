export enum LogType {
  MSG_RECEIVED = 'MSG_RECEIVED',
  API_SETUP = 'API_SETUP',
  AUDIO = 'AUDIO',
  ROUTER = 'ROUTER',
}

// Allows us to quickly enable certain types of logging messages and
// disable others
class Logger {
  public static info(message: string, type?: LogType): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(type, message);
    }
  }

  public static warning(message: string, type?: LogType): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log('WARNING', type, message);
    }
  }

  public static error(message: string, type?: LogType): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log('ERROR', type, message);
    }
  }
}

export default Logger;
