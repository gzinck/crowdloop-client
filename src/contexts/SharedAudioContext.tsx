import React from 'react';
import LimiterNode from 'audio-limiter';
import { limiterLookaheadDelay } from '../audio/constants';

// This is ugly, but we need a way to update the current time
// in non-react objects, so we need a "pointer" to the current
// time. This is NOT react-y---it's like a hack to be more like
// C in behaviour.
class MutableTime {
  public time: number;
  constructor(time: number) {
    this.time = time;
  }
  setTime(time: number) {
    this.time = time;
  }
}

export interface SharedAudioContextContents {
  ctx: AudioContext;
  destination: AudioNode;
  // local time when the global session started, in seconds, factoring in delay with the server
  // NOTE: this might be negative!
  startTime: MutableTime;
}

// Singleton design pattern so we don't accidentally make multiple audio contexts
class DefaultContents {
  private static contents?: SharedAudioContextContents;
  public static get(): SharedAudioContextContents {
    if (!DefaultContents.contents) {
      const ctx = new AudioContext();

      // Sound architecture: [NODES] => [compressor] => [gain] => [limiter] => [destination]
      const limiter = new LimiterNode(ctx, { time: limiterLookaheadDelay });
      limiter.connect(ctx.destination);

      // Increase gain to 4 to really compress audio so it's always loud.
      // Clipping is avoided using the limiter, so it'll output fine.
      const gain = ctx.createGain();
      gain.gain.value = 4;
      gain.connect(limiter);

      // For old iOS compatability, create the compressor in this gross way
      const compressor = ctx.createDynamicsCompressor();
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.knee.setValueAtTime(30, ctx.currentTime);
      compressor.ratio.setValueAtTime(12, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);
      compressor.threshold.setValueAtTime(-24, ctx.currentTime);
      compressor.connect(gain);

      DefaultContents.contents = {
        ctx,
        destination: compressor,
        startTime: new MutableTime(0),
      };
    }

    return DefaultContents.contents;
  }
}

// Always make sure we are within a provider
const SharedAudioContext = React.createContext<SharedAudioContextContents>(
  {} as SharedAudioContextContents,
);

export const SharedAudioContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement => {
  return (
    <SharedAudioContext.Provider value={DefaultContents.get()}>
      {children}
    </SharedAudioContext.Provider>
  );
};

export default SharedAudioContext;
