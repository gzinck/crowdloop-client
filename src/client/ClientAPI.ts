import { io } from 'socket.io-client';
import AudienceAPI from './AudienceAPI';
import AudioAPI from './AudioAPI';
import ClockAPI from './ClockAPI';
import SessionAPI from './SessionAPI';

const serverURL = 'ws://localhost:2000';

class ClientAPI {
  public readonly audio: AudioAPI;
  public readonly sessionID: string;
  public readonly session: SessionAPI;
  public readonly clock: ClockAPI;
  public readonly audience: AudienceAPI;
  public isActive = false;

  constructor(ctx: AudioContext, sessionID: string) {
    const socket = io(serverURL);
    this.sessionID = sessionID;
    this.audio = new AudioAPI(socket, sessionID);
    this.session = new SessionAPI(socket, sessionID);
    this.clock = new ClockAPI(socket, ctx, sessionID);
    this.audience = new AudienceAPI(socket, sessionID);
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
  }
}

export default ClientAPI;
