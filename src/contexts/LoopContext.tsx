import React from 'react';
import SharedAudioContext from './SharedAudioContext';
import APIContext from './APIContext';
import LoopBuffer from '../audio/loopPlayer/loopBuffer';
import Logger, { LogType } from '../utils/Logger';

interface LoopContextContents {
  loops: Record<string, LoopBuffer>;
}

const defaultContents: LoopContextContents = {
  loops: {},
};

const LoopContext = React.createContext<LoopContextContents>(defaultContents);

export const LoopContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement => {
  const audio = React.useContext(SharedAudioContext);
  const { client } = React.useContext(APIContext);
  const [loops, setLoops] = React.useState<Record<string, LoopBuffer>>({});

  // Reset the loop map whenever the client changes
  React.useEffect(() => {
    setLoops((loops) => {
      Object.values(loops).forEach((loop) => loop.stop());
      return {};
    });
  }, [client]);

  // When we get a new client,
  React.useEffect(() => {
    if (client && !client.isActive) {
      // Set the clock's delay (callback after join session)
      client.clock.setOnClock((delay) => {
        Logger.info(`clock has a delay of ${delay} ms`, LogType.MSG_RECEIVED);
        audio.startTime.setTime(-delay / 1000); // convert to seconds
        // Once we have the clock correct, we can start getting audio
        client.audio.refresh();
      });

      client.audio.setOnCreate((req) => {
        Logger.info(`creating loop ${req.loopID}`, LogType.MSG_RECEIVED);
        const newLoop = new LoopBuffer(audio, req);
        setLoops((loops) => ({
          ...loops,
          [req.loopID]: newLoop,
        }));
      });
      client.audio.setOnSet((req) => {
        Logger.info(`adding packet ${req.packet} to loop ${req.loopID}`, LogType.MSG_RECEIVED);
        // Wrap it so we don't need it as a dependency for useEffect
        setLoops((loops) => {
          loops[req.loopID].addBuffer(req);
          return loops;
        });
      });
      client.audio.setOnDelete((req) => {
        Logger.info(`deleting loop ${req.loopID}`, LogType.MSG_RECEIVED);
        setLoops((loops) => {
          loops[req.loopID]?.stop();
          const newLoops = { ...loops };
          delete loops[req.loopID];
          return newLoops;
        });
      });
      client.audio.setOnPlay((req) => {
        Logger.info(`playing loop ${req.loopID}`, LogType.MSG_RECEIVED);
        setLoops((loops) => {
          loops[req.loopID]?.start(req.startTime);
          return loops;
        });
      });
      client.audio.setOnStop((req) => {
        Logger.info(`stopping loop ${req.loopID}`, LogType.MSG_RECEIVED);
        setLoops((loops) => {
          loops[req.loopID]?.stop();
          return loops;
        });
      });

      client.joinSession(); // this will set client as active
    }
  }, [audio, client]);

  return (
    <LoopContext.Provider
      value={{
        loops,
      }}
    >
      {children}
    </LoopContext.Provider>
  );
};

export default LoopContext;
