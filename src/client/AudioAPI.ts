import { Socket } from 'socket.io-client';
import Logger, { LogType } from '../utils/Logger';
import * as events from './events';

export interface CreateAudioReq {
  loopID: string;
  startAt: number;
  nPackets: number;
  bpbar: number; // beats per bar
  bpm: number; // beats per minute
  nBars: number; // number of bars in new loops
  isStopped?: boolean; // whether the loop is going to play right away or not
  x: number;
  y: number;
  radius: number;
}

export interface SetAudioReq {
  loopID: string;
  packet: number;
  file: Uint8Array;
  meta: {
    head: number;
    length: number;
  };
}

export interface MoveAudioReq {
  loopID: string;
  x: number;
  y: number;
  radius: number;
}

interface PlayAudioReq {
  loopID: string;
  startTime: number;
}

interface StopAudioReq {
  loopID: string;
}

interface DeleteAudioReq {
  loopID: string;
  nPackets: number;
}

class AudioAPI {
  private readonly sessionID: string;
  private readonly io: Socket;

  constructor(io: Socket, sessionID: string) {
    this.io = io;
    this.sessionID = sessionID;

    io.onAny((e, ...args) => {
      console.log(e, args);
    });
  }

  public cleanup(): void {
    Logger.info(`cleaning up old client ${this.sessionID}`, LogType.API_SETUP);
    this.io.removeAllListeners(events.AUDIO_PLAY);
    this.io.removeAllListeners(events.AUDIO_STOP);
    this.io.removeAllListeners(events.AUDIO_CREATE);
    this.io.removeAllListeners(events.AUDIO_SET);
    this.io.removeAllListeners(events.AUDIO_MOVE);
    this.io.removeAllListeners(events.AUDIO_DELETE);
  }

  public setOnPlay(cb: (req: PlayAudioReq) => void): void {
    this.io.on(events.AUDIO_PLAY, cb);
  }

  public setOnStop(cb: (req: StopAudioReq) => void): void {
    this.io.on(events.AUDIO_STOP, cb);
  }

  // Make sure to check whether isStopped is true in the request
  public setOnCreate(cb: (req: CreateAudioReq) => void): void {
    this.io.on(events.AUDIO_CREATE, cb);
  }

  public setOnSet(cb: (req: SetAudioReq) => void): void {
    this.io.on(events.AUDIO_SET, cb);
  }

  public setOnMove(cb: (req: MoveAudioReq) => void): void {
    this.io.on(events.AUDIO_MOVE, cb);
  }

  public setOnDelete(cb: (req: DeleteAudioReq) => void): void {
    this.io.on(events.AUDIO_DELETE, cb);
  }

  // Trigger a full refresh to make sure we have everything
  public refresh(): void {
    this.io.emit(events.AUDIO_REFRESH, this.sessionID);
  }
}

export default AudioAPI;
