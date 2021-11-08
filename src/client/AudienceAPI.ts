import { Socket } from 'socket.io-client';
import * as events from './events';

export interface AudiencePos {
  x: number; // in [0, 1]
  y: number; // in [0, 1]
}

class AudienceAPI {
  private readonly sessionID: string;
  private readonly io: Socket;

  constructor(io: Socket, sessionID: string) {
    this.sessionID = sessionID;
    this.io = io;
  }

  public cleanup(): void {
    // Add cleanup if needed later on
  }

  public setPos(pos: AudiencePos): void {
    this.io.emit(events.AUDIENCE_POS_SET, {
      sessionID: this.sessionID,
      ...pos,
    });
  }
}

export default AudienceAPI;
