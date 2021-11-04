import React from 'react';
import LoopBoard from './components/loopBoard/LoopBoard';
import { LoopContextProvider } from './contexts/LoopContext';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { GET_STARTED_ROUTE, LOOP_BOARD_ROUTE } from './routes';
import GetStartedPage from './components/getStartedPage/GetStartedPage';
import { SharedAudioContextProvider } from './contexts/SharedAudioContext';
import { APIContextProvider } from './contexts/APIContext';

function App(): React.ReactElement {
  return (
    <Router>
      <SharedAudioContextProvider>
        <APIContextProvider>
          <LoopContextProvider>
            <Switch>
              <Route path={LOOP_BOARD_ROUTE}>
                <LoopBoard />
              </Route>
              <Route path={GET_STARTED_ROUTE}>
                <GetStartedPage />
              </Route>
            </Switch>
          </LoopContextProvider>
        </APIContextProvider>
      </SharedAudioContextProvider>
    </Router>
  );
}

export default App;
