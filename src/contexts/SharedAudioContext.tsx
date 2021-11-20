import React from 'react';

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

      // For old iOS compatability, create the compressor in this gross way
      const destination = ctx.createDynamicsCompressor();
      destination.attack.setValueAtTime(0.003, ctx.currentTime);
      destination.knee.setValueAtTime(30, ctx.currentTime);
      destination.ratio.setValueAtTime(12, ctx.currentTime);
      destination.release.setValueAtTime(0.25, ctx.currentTime);
      destination.threshold.setValueAtTime(-24, ctx.currentTime);
      destination.connect(ctx.destination);

      DefaultContents.contents = {
        ctx,
        destination,
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
