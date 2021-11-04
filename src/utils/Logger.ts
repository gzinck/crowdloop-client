export enum LogType {
  MSG_RECEIVED = 'MSG_RECEIVED',
  API_SETUP = 'API_SETUP',
}

// Allows us to quickly enable certain types of logging messages and
// disable others
class Logger {
  public static info(message: string, type?: LogType): void {
    console.log(type, message);
  }
}

export default Logger;
