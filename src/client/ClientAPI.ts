import { io } from 'socket.io-client';
import AudioAPI from './AudioAPI';
import ClockAPI from './ClockAPI';
import SessionAPI from './SessionAPI';

const serverURL = 'ws://localhost:2000';

class ClientAPI {
  public readonly audio: AudioAPI;
  public readonly sessionID: string;
  private readonly session: SessionAPI;
  public readonly clock: ClockAPI;
  public isActive = false;

  constructor(ctx: AudioContext, sessionID: string) {
    const socket = io(serverURL);
    this.sessionID = sessionID;
    this.audio = new AudioAPI(socket, sessionID);
    this.session = new SessionAPI(socket, sessionID);
    this.clock = new ClockAPI(socket, ctx, sessionID);
  }

  public joinSession(): void {
    this.session.joinSession();
    this.isActive = true;
    this.clock.getClock();
  }

  public cleanup(): void {
    this.clock.cleanup();
    this.audio.cleanup();
  }
}

export default ClientAPI;
