import { BehaviorSubject, Observable } from 'rxjs';
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

  // Expose only the observable
  private readonly syncSubject$ = new BehaviorSubject<boolean>(true);
  public readonly isSyncing$: Observable<boolean> = this.syncSubject$;

  constructor(io: Socket, ctx: AudioContext, sessionID: string) {
    this.sessionID = sessionID;
    this.io = io;

    io.on(events.CLOCK_PING, (req: PingReq) => {
      Logger.info(`got a ping with startTime ${req.startTime}`, LogType.MSG_RECEIVED);
      this.syncSubject$.next(true);
      io.emit(events.CLOCK_PONG, {
        ...req,
        sessionID: this.sessionID,
        clientTime: ctx.currentTime * 1000, // convert to ms
      });
    });
  }

  public setOnClock(cb: (delay: number) => void): void {
    this.io.on(events.CLOCK_GET, (delay: number) => {
      this.syncSubject$.next(false);
      cb(delay);
    });
  }

  public getClock(): void {
    this.syncSubject$.next(true);
    this.io.emit(events.CLOCK_GET);
  }

  public cleanup(): void {
    this.io.removeAllListeners(events.CLOCK_PING);
    this.io.removeAllListeners(events.CLOCK_GET);
  }
}

export default ClockAPI;
