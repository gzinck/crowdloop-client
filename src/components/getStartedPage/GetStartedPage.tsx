import React from 'react';
import { useHistory } from 'react-router';
import { interval } from 'rxjs';
import styled from 'styled-components';
import APIContext from '../../contexts/APIContext';
import SharedAudioContext from '../../contexts/SharedAudioContext';
import { LOOP_BOARD_ROUTE } from '../../routes';
import theme from '../../theme';
import Button from '../generic/Button';

const Background = styled.div`
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  background-color: ${theme.palette.background.default};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 5rem;
  color: ${theme.palette.background.contrastText};
`;

const GetStartedPage = (): React.ReactElement => {
  const history = useHistory();
  const audio = React.useContext(SharedAudioContext);
  const { startSession } = React.useContext(APIContext);
  const [clicked, setClicked] = React.useState(false);

  const startCtx = React.useCallback(() => {
    setClicked(true); // show that something is happening
    audio.ctx.resume();
    const sub = interval(50).subscribe(() => {
      if (audio.ctx.currentTime !== 0) {
        sub.unsubscribe();
        startSession();
        history.push(LOOP_BOARD_ROUTE);
      }
    });

    return () => sub.unsubscribe();
  }, [history, audio.ctx, startSession]);

  return (
    <Background>
      <p>Welcome to CrowdLoop! Click the button below to join the session.</p>
      <Button onClick={startCtx}>{clicked ? 'Joining...' : 'Join session'}</Button>
    </Background>
  );
};

export default GetStartedPage;
