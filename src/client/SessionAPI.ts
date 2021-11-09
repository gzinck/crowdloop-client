import { Socket } from 'socket.io-client';
import * as events from './events';

class SessionAPI {
  private readonly sessionID: string;
  private readonly io: Socket;

  constructor(io: Socket, sessionID: string) {
    this.sessionID = sessionID;
    this.io = io;
  }

  public cleanup(): void {
    this.io.removeAllListeners(events.SESSION_DELETE);
  }

  public joinSession(): void {
    this.io.emit(events.SESSION_JOIN, this.sessionID);
  }

  public setOnEnd(cb: () => void): void {
    this.io.on(events.SESSION_DELETE, cb);
  }
}

export default SessionAPI;
