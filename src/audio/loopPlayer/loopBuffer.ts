import { Subject, Subscription, timer } from 'rxjs';
import { getLoopLength, getSecondsUntilStart } from '../../utils/beats';
import { SharedAudioContextContents } from '../../contexts/SharedAudioContext';
import { CreateAudioReq, SetAudioReq } from '../../client/AudioAPI';
import Logger, { LogType } from '../../utils/Logger';
import { limiterLookaheadDelay } from '../constants';

const recordingHead = 0.1; // default size of the head for audio files
const previewSize = 200;
const schedulingTime = 0.05; // time in s before loop start at which point we should start scheduling things
const stopTime = 0.05; // time to stop the audio if needed ASAP

interface AudioStartEvent {
  idx: number;
  startTime: number; // time in s in the AudioContext when audio should start
  curGainNode: GainNode;
  prvGainNode: GainNode;
}

interface Dimensions {
  x: number;
  y: number;
  radius: number;
}

interface OffsetedBuffer {
  // A decoded AudioBuffer
  buff: AudioBuffer;
  // seconds before the actual start that the recording begins
  head: number;
  // seconds in the actual desired part of the recording
  length: number;
}

export interface OffsetedBufferInput {
  file: ArrayBuffer;
  idx: number;
  head: number;
  length: number;
}

export interface LoopProgress {
  normalized: number; // in [0, 1)
  time: number; // curr time in the loop
  beats: number; // current beat in the loop (float)
}

// VISUAL MODEL OF HOW A LOOP BUFFER WORKS:
//
// |------|--------------------------------|------|
// | Head | Main recording                 | Tail |
// |------|--------------------------------|------|
// | B1H  | Buffer 1 | B1T  |---------------------|
// |----------| B2H  | Buffer 2 | B2T  |----------|
// |---------------------| B3H  | Buffer 3 | B3T  |
//
// When played, the main recording of one instance should be directly adjacent to the
// main recording of another instance.

class LoopBuffer {
  private readonly buffers: (OffsetedBuffer | null)[];
  public readonly rawPreview: Float32Array = new Float32Array(previewSize).fill(0);
  public preview: Float32Array;
  private readonly req: CreateAudioReq;
  public pos: Dimensions;
  private readonly audio: SharedAudioContextContents;
  private playSubscription?: Subscription;
  private gainNode1: GainNode;
  private gainNode2: GainNode;
  private mainGainNode: GainNode;
  private volumeGainNode: GainNode;
  public stopped = true;
  public isMuted = true;

  /**
   *
   * @param audio the audio context to use when adding buffers and starting loop
   * @param ms duration of the main loop
   * @param head amount of time before the main loop starts (fade-in time in s)
   * @param tail amount of time after the main loop ends (fade-out time in s)
   * @param nBuffers the number of separate audio files in the loop
   */
  constructor(audio: SharedAudioContextContents, req: CreateAudioReq) {
    this.preview = this.rawPreview; // For now, preview is unscaled
    this.audio = audio;
    this.req = req;
    this.pos = { x: req.x, y: req.y, radius: req.radius };
    this.buffers = new Array(req.nPackets).fill(null);

    // Gain nodes handle the fade in and out
    // Proximity gain is for how close the loop is to the current position
    this.volumeGainNode = audio.ctx.createGain();
    this.volumeGainNode.gain.value = 0;
    this.volumeGainNode.connect(audio.destination);

    // Main gain is for the emergency stops
    this.mainGainNode = audio.ctx.createGain();
    this.mainGainNode.gain.value = 0;
    this.mainGainNode.connect(this.volumeGainNode);

    // Other gain is for fading in/out pieces of the audio file
    this.gainNode1 = audio.ctx.createGain();
    this.gainNode1.gain.value = 0;
    this.gainNode1.connect(this.mainGainNode);

    this.gainNode2 = audio.ctx.createGain();
    this.gainNode2.gain.value = 0;
    this.gainNode2.connect(this.mainGainNode);
  }

  public setVolume(vol: number): void {
    Logger.info(`setting volume to ${vol}`, LogType.AUDIO);
    this.volumeGainNode.gain.cancelScheduledValues(this.audio.ctx.currentTime);
    this.volumeGainNode.gain.setValueAtTime(
      this.volumeGainNode.gain.value,
      this.audio.ctx.currentTime,
    );
    this.volumeGainNode.gain.linearRampToValueAtTime(vol, this.audio.ctx.currentTime + 0.1);
    this.isMuted = vol === 0;
  }

  public move(pos: Dimensions): void {
    this.pos = pos;
  }

  public addBuffer(req: SetAudioReq): Promise<void> {
    if (req.packet < 0 || req.packet >= this.buffers.length) {
      throw new Error(`tried to add an audio buffer out of range: ${req.packet}`);
    }
    if (this.buffers[req.packet]) {
      Logger.info(
        `buffer ${req.packet} was not added because it was already present`,
        LogType.AUDIO,
      );
      return new Promise<void>((r) => r());
    }

    // This is necessary because the input ArrayBuffer may be detached.
    const buff = new Uint8Array(req.file).buffer;
    return this.audio.ctx.decodeAudioData(buff).then((audioBuffer) => {
      this.buffers[req.packet] = {
        buff: audioBuffer,
        length: req.meta.length,
        head: req.meta.head,
      };
      const floats = audioBuffer.getChannelData(0);

      // create a preview by sampling the floats
      const destSize = previewSize / this.buffers.length;
      const destStart = destSize * req.packet;

      const sourceSize = audioBuffer.sampleRate * req.meta.length;
      const sourceStart = Math.floor(audioBuffer.sampleRate * req.meta.head);

      for (let destPos = destStart; destPos < destStart + destSize; destPos++) {
        const srcPos = Math.floor((destPos - destStart) * (sourceSize / destSize)) + sourceStart;
        this.rawPreview[destPos] = floats[srcPos];
      }

      if (!this.buffers.includes(null)) {
        // Normalize the preview values to [0, 1]
        const minVal = this.rawPreview.reduce((curMin, cur) => Math.min(curMin, cur), 0);
        const maxVal = this.rawPreview.reduce((curMax, cur) => Math.max(curMax, cur), 0);
        this.preview = this.rawPreview.map((val) => (val - minVal) / (maxVal - minVal));
      }

      // If this is the first buffer and we're supposed to be playing, start it
      if (this.stopped && !this.req.isStopped && req.packet === 0) {
        this.start(this.req.startAt);
      }
    });
  }

  /**
   * Stops the loop (if it was previously started)
   */
  public stop(): void {
    this.stopped = true;
    this.mainGainNode.gain.setValueAtTime(1, this.audio.ctx.currentTime);
    this.mainGainNode.gain.linearRampToValueAtTime(0, this.audio.ctx.currentTime + stopTime);
    this.playSubscription?.unsubscribe();
  }

  // startTimeRaw should use the startTime for the host, not the client. We convert appropriately.
  // If n
  /**
   * Starts the loop
   * @param startTimeRaw the start time for the loop from the host's perspective (NOT the client).
   * If not defined, then it starts when the clock says it probably should.
   */
  public start(startTimeRaw?: number): void {
    this.stopped = false;
    const events$ = new Subject<AudioStartEvent>();
    const loopLength = getLoopLength(this.req);
    // Assumption: all buffers are the same size.
    // Could just use the buffers' lengths, but what if not all buffers are loaded yet?
    const buffLength = loopLength / this.buffers.length;

    // NOTE: startTime ALWAYS refers to when the main part of the loop starts,
    // diregarding the head
    this.playSubscription?.unsubscribe();
    this.playSubscription = events$.subscribe(({ idx, startTime, curGainNode, prvGainNode }) => {
      const buffer = this.buffers[idx];

      // Schedule the next change right away
      const nxtIdx = (idx + 1) % this.buffers.length;
      const nxtHead = this.buffers[nxtIdx]?.head || recordingHead;

      // Always calculate startTime using the clock time to ensure we stay on track with updated clock
      const nxtStartTime =
        ((getSecondsUntilStart(this.req, this.audio) + nxtIdx * buffLength) %
          getLoopLength(this.req)) +
        this.audio.ctx.currentTime;

      const timeUntilNext = Math.max(
        nxtStartTime -
          this.audio.ctx.currentTime -
          nxtHead -
          schedulingTime -
          limiterLookaheadDelay,
        0,
      );
      // Override stop if the subscription fails to unsubscribe (probably not needed)
      if (!this.stopped) {
        timer(timeUntilNext * 1000).subscribe(() => {
          events$.next({
            idx: nxtIdx,
            startTime: nxtStartTime,
            curGainNode: prvGainNode,
            prvGainNode: curGainNode,
          });
        });
      }

      // Swap the gain nodes
      let fadeInTime = startTime - (buffer?.head || recordingHead) - limiterLookaheadDelay;
      let offset: number | undefined = undefined;
      if (fadeInTime < this.audio.ctx.currentTime) {
        offset = this.audio.ctx.currentTime - fadeInTime;
        fadeInTime = this.audio.ctx.currentTime;
      }

      // Immediately swap gain nodes if start time is passed, otherwise go slowly
      if (fadeInTime >= startTime) {
        prvGainNode.gain.setValueAtTime(0, fadeInTime);
        curGainNode.gain.setValueAtTime(1, fadeInTime);
      } else {
        prvGainNode.gain.setValueAtTime(1, fadeInTime);
        prvGainNode.gain.linearRampToValueAtTime(0, startTime);

        curGainNode.gain.setValueAtTime(0, fadeInTime);
        curGainNode.gain.linearRampToValueAtTime(1, startTime);
      }

      // Also make sure the main gain is up
      this.mainGainNode.gain.setValueAtTime(1, fadeInTime);

      // If the buffer is empty, simply wait until the next buffer begins
      // (already scheduled)
      if (buffer === null) {
        Logger.error(`loop ${this.req.loopID} buffer was null in position: ${idx}`, LogType.AUDIO);
        return;
      }

      // Create our new buffer source
      const source = this.audio.ctx.createBufferSource();
      source.buffer = buffer.buff;
      source.connect(curGainNode);

      if (!this.stopped) source.start(fadeInTime, offset);
    });

    // Schedule the first buffer
    const firstHead = this.buffers[0]?.head || recordingHead;
    const timeUntilFirst = getSecondsUntilStart(
      this.req,
      this.audio,
      schedulingTime + limiterLookaheadDelay,
    );
    const startTime = startTimeRaw && startTimeRaw + this.audio.startTime.time;
    console.log(`FYI: start time for audio ctx is ${this.audio.startTime.time}`);
    Logger.info(
      `Starting a new loop at server time ${startTimeRaw} amd client time ${startTime} when curr time is ${this.audio.ctx.currentTime}`,
      LogType.AUDIO,
    );
    const firstStartTime =
      startTime && startTime > this.audio.ctx.currentTime + schedulingTime
        ? startTime
        : timeUntilFirst + this.audio.ctx.currentTime;

    timer((timeUntilFirst - firstHead - schedulingTime - firstStartTime) * 1000).subscribe(() => {
      events$.next({
        idx: 0,
        startTime: firstStartTime,
        curGainNode: this.gainNode1,
        prvGainNode: this.gainNode2,
      });
    });
  }

  public getProgress(): LoopProgress {
    const deltaTime = this.audio.ctx.currentTime - this.audio.startTime.time; // in s
    const beatsSinceStart = deltaTime * (this.req.bpm / 60);
    const nBeats = this.req.bpbar * this.req.nBars;
    const beats = beatsSinceStart % nBeats;
    return {
      normalized: beats / nBeats,
      time: beats / (this.req.bpm / 60),
      beats,
    };
  }
}

export default LoopBuffer;
