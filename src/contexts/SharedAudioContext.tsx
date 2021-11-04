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
  // local time when the global session started, in seconds, factoring in delay with the server
  // NOTE: this might be negative!
  startTime: MutableTime;
}

// Singleton so we don't accidentally instantiate multiple contexts
class AudioContextSingleton {
  private static ctx?: AudioContext;
  public static getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
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
  const time = React.useRef<MutableTime>(new MutableTime(0));

  return (
    <SharedAudioContext.Provider
      value={{
        ctx: AudioContextSingleton.getCtx(),
        startTime: time.current,
      }}
    >
      {children}
    </SharedAudioContext.Provider>
  );
};

export default SharedAudioContext;
