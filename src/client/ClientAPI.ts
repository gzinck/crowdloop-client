import { io, Socket } from 'socket.io-client';
import AudienceAPI from './AudienceAPI';
import AudioAPI from './AudioAPI';
import ClockAPI from './ClockAPI';
import SessionAPI from './SessionAPI';

const URL = 'ws://localhost:2000';

class ClientAPI {
  private readonly socket: Socket;
  public readonly audio: AudioAPI;
  public readonly sessionID: string;
  public readonly session: SessionAPI;
  public readonly clock: ClockAPI;
  public readonly audience: AudienceAPI;
  public isActive = false;

  constructor(ctx: AudioContext, sessionID: string) {
    this.socket = io(process.env.REACT_APP_SERVER_URL || URL);
    this.sessionID = sessionID;
    this.audio = new AudioAPI(this.socket, sessionID);
    this.session = new SessionAPI(this.socket, sessionID);
    this.clock = new ClockAPI(this.socket, ctx, sessionID);
    this.audience = new AudienceAPI(this.socket, sessionID);
  }

  public joinSession(): void {
    this.session.joinSession();
    this.isActive = true;
    this.clock.getClock();
  }

  public cleanup(): void {
    this.clock.cleanup();
    this.audio.cleanup();
    this.audience.cleanup();
    this.session.cleanup();
    this.socket.close();
  }
}

export default ClientAPI;
