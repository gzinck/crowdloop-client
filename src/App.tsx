import React from 'react';
import LoopBoard from './components/loopBoard/LoopBoard';
import { LoopContextProvider } from './contexts/LoopContext';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { GET_STARTED_ROUTE, LOOP_BOARD_ROUTE, SET_POS_ROUTE, SURVEY_ROUTE } from './routes';
import GetStartedPage from './components/getStartedPage/GetStartedPage';
import { SharedAudioContextProvider } from './contexts/SharedAudioContext';
import { APIContextProvider } from './contexts/APIContext';
import PositionChooser from './components/positionChooser/PositionChooser';
import SurveyPage from './components/surveyPage/SurveyPage';

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
              <Route path={SET_POS_ROUTE}>
                <PositionChooser />
              </Route>
              <Route path={SURVEY_ROUTE}>
                <SurveyPage />
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
