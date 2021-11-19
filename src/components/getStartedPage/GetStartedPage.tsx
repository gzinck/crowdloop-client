import React from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router';
import { interval, Subscription } from 'rxjs';
import APIContext from '../../contexts/APIContext';
import SharedAudioContext from '../../contexts/SharedAudioContext';
import { SET_POS_ROUTE } from '../../routes';
import Button from '../generic/Button';
import Background from '../generic/Background';

const Text = styled.p`
  text-align: center;
  max-width: 400px;
`;

const STATUS = {
  DEFAULT: 'Start',
  START_CTX: 'Please click again',
  CONNECTING: 'Connecting (this takes 5-15s)...',
  READY: 'Next',
};

const GetStartedPage = (): React.ReactElement => {
  const history = useHistory();
  const audio = React.useContext(SharedAudioContext);
  const { startSession } = React.useContext(APIContext);
  const [status, setStatus] = React.useState<string>(STATUS.DEFAULT);
  const sub = React.useRef<Subscription | null>(null);

  const startCtx = () => {
    if (status === STATUS.READY) {
      history.push(SET_POS_ROUTE);
      return;
    }

    setStatus(STATUS.START_CTX); // show that something is happening
    audio.ctx.resume();

    if (sub.current) sub.current.unsubscribe();
    sub.current = interval(50).subscribe(() => {
      console.log(audio.ctx.currentTime, audio.startTime.time);
      if (audio.ctx.currentTime !== 0) {
        sub.current?.unsubscribe();
        startSession();
        setStatus(STATUS.CONNECTING);
        sub.current = interval(50).subscribe(() => {
          if (audio.startTime.time !== 0) {
            sub.current?.unsubscribe();
            setStatus(STATUS.READY);
          }
        });
      }
    });
  };

  return (
    <Background>
      {status === STATUS.DEFAULT && (
        <Text>Welcome to CrowdLoop! Click the button below to join the session.</Text>
      )}
      {(status === STATUS.CONNECTING || status === STATUS.READY) && (
        <Text>
          While you wait, turn up your phone&#39;s volume and turn off mute. If possible, turn on
          &quot;Do Not Disturb&quot; mode on your device.
        </Text>
      )}
      {status === STATUS.READY && (
        <Text>
          Make sure your phone doesn&#39;t take a nap! Tap your screen regularly to keep it awake.
        </Text>
      )}
      <Button onClick={startCtx} disabled={status === STATUS.CONNECTING}>
        {status}
      </Button>
    </Background>
  );
};

export default GetStartedPage;
