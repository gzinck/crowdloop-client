import React from 'react';
import { useHistory } from 'react-router';
import ClientAPI from '../client/ClientAPI';
import SharedAudioContext from './SharedAudioContext';
import { GET_STARTED_ROUTE } from '../routes';
import Logger, { LogType } from '../utils/Logger';

const sessionID = 'default';

interface APIContextContents {
  client?: ClientAPI;
  startSession: () => void;
  endSession: () => void;
}

const APIContext = React.createContext<APIContextContents>({} as APIContextContents);

export const APIContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement => {
  const { ctx } = React.useContext(SharedAudioContext);
  const history = useHistory();
  const [client, setClient] = React.useState<ClientAPI>();

  // Start the clock right away
  React.useEffect(() => {
    if (!client && history.location.pathname !== '/') {
      history.push(GET_STARTED_ROUTE);
    }
  }, [client, history]);

  const startSession = React.useCallback(() => {
    setClient((client) => {
      if (client) client.cleanup();
      Logger.info(`setting up new client ${sessionID}`, LogType.API_SETUP);
      return new ClientAPI(ctx, sessionID);
    });
  }, [ctx]);

  const endSession = React.useCallback(() => {
    setClient((client) => {
      if (client) client.cleanup();
      return undefined;
    });
  }, []);

  return (
    <APIContext.Provider
      value={{
        client,
        startSession,
        endSession,
      }}
    >
      {children}
    </APIContext.Provider>
  );
};

export default APIContext;
