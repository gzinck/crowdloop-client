import React from 'react';
import SharedAudioContext from './SharedAudioContext';
import APIContext from './APIContext';
import LoopBuffer from '../audio/loopPlayer/loopBuffer';
import Logger, { LogType } from '../utils/Logger';
import { AudiencePos } from '../client/AudienceAPI';
import { assignVolumeSimpleRadius } from '../utils/volumeAssigner';

interface LoopContextContents {
  loops: Record<string, LoopBuffer>;
  position: AudiencePos;
  setPosition: (pos: AudiencePos) => void;
}

const defaultContents: LoopContextContents = {
  loops: {},
  position: { x: 0, y: 0 },
  setPosition: () => null,
};

const LoopContext = React.createContext<LoopContextContents>(defaultContents);

export const LoopContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement => {
  const audio = React.useContext(SharedAudioContext);
  const { client, endSession } = React.useContext(APIContext);
  const [loops, setLoops] = React.useState<Record<string, LoopBuffer>>({});

  // Keep track of the position in space
  const [position, setPos] = React.useState<AudiencePos>(defaultContents.position);
  const setPosition = React.useCallback(
    (pos: AudiencePos) => {
      setPos(pos);
      console.log('Setting position of loops');
      if (client) client.audience.setPos(pos);

      // Set the volume for each of these
      assignVolumeSimpleRadius(loops, pos);
    },
    [client, loops],
  );

  // Every time something changes, decide on the loop volumes
  React.useEffect(() => {
    assignVolumeSimpleRadius(loops, position);
  }, [position, loops]);

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
        req.file = new Uint8Array(req.file);

        // Wrap it so we don't need it as a dependency for useEffect
        setLoops((loops) => {
          const newLoops = { ...loops };
          newLoops[req.loopID].addBuffer(req);
          return newLoops;
        });
      });
      client.audio.setOnMove((req) => {
        Logger.info(`moving loop ${req.loopID} to pos (${req.x}, ${req.y})`, LogType.MSG_RECEIVED);
        setLoops((loops) => {
          if (loops[req.loopID] === undefined) {
            Logger.warning(
              `could not move loop ${req.loopID} because it was not yet created`,
              LogType.AUDIO,
            );
            return loops;
          }
          const newLoops = { ...loops };
          newLoops[req.loopID].move(req);
          console.log('Does this trigger a refresh?');
          return newLoops;
        });
      });
      client.audio.setOnDelete((req) => {
        Logger.info(`deleting loop ${req.loopID}`, LogType.MSG_RECEIVED);
        setLoops((loops) => {
          const newLoops = { ...loops };
          newLoops[req.loopID].stop();
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
      client.session.setOnEnd(() => {
        Logger.info('stopping session', LogType.MSG_RECEIVED);
        setLoops((loops) => {
          Object.values(loops).forEach((loop) => loop.stop());
          return {};
        });
        endSession();
      });

      client.joinSession(); // this will set client as active
    }
  }, [audio, client, endSession]);

  return (
    <LoopContext.Provider
      value={{
        loops,
        position,
        setPosition,
      }}
    >
      {children}
    </LoopContext.Provider>
  );
};

export default LoopContext;
