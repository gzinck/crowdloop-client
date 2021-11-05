import { Socket } from 'socket.io-client';
import Logger, { LogType } from '../utils/Logger';
import * as events from './events';

interface PingReq {
  startTime: number;
  deltas?: number[];
}

class ClockAPI {
  private readonly sessionID: string;
  private readonly io: Socket;

  constructor(io: Socket, ctx: AudioContext, sessionID: string) {
    this.sessionID = sessionID;
    this.io = io;

    io.on(events.CLOCK_PING, (req: PingReq) => {
      Logger.info(`got a ping with startTime ${req.startTime}`, LogType.MSG_RECEIVED);
      io.emit(events.CLOCK_PONG, {
        ...req,
        sessionID: this.sessionID,
        clientTime: ctx.currentTime * 1000, // convert to ms
      });
    });
  }

  public setOnClock(cb: (delay: number) => void): void {
    this.io.on(events.CLOCK_GET, cb);
  }

  public getClock(): void {
    this.io.emit(events.CLOCK_GET);
  }

  public cleanup(): void {
    this.io.removeAllListeners(events.CLOCK_PING);
    this.io.removeAllListeners(events.CLOCK_GET);
  }
}

export default ClockAPI;
