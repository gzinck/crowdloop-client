import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router';
import { interval } from 'rxjs';
import APIContext from '../../contexts/APIContext';
import SharedAudioContext from '../../contexts/SharedAudioContext';
import { SET_POS_ROUTE } from '../../routes';
import Button from '../generic/Button';
import Background from '../generic/Background';

const Text = styled.p`
  text-align: center;
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
        history.push(SET_POS_ROUTE);
      }
    });

    return () => sub.unsubscribe();
  }, [history, audio.ctx, startSession]);

  return (
    <Background>
      <Text>Welcome to CrowdLoop! Click the button below to join the session.</Text>
      <Button onClick={startCtx}>{clicked ? 'Joining...' : 'Join session'}</Button>
    </Background>
  );
};

export default GetStartedPage;
