import React from 'react';
import styled from 'styled-components';
import Button from '../generic/Button';
import { interval, Subscription, timer } from 'rxjs';
import APIContext from '../../contexts/APIContext';
import theme from '../../theme';
import SharedAudioContext from '../../contexts/SharedAudioContext';
import { useHistory } from 'react-router';
import { SET_POS_ROUTE } from '../../routes';

const TopButton = styled(Button)`
  position: fixed;
  top: 1rem;
  right: 1rem;
  background-color: ${theme.palette.background.light};
  color: ${theme.palette.background.contrastText};
`;

const SyncButton = (): React.ReactElement => {
  const { startSession, client } = React.useContext(APIContext);
  const { ctx } = React.useContext(SharedAudioContext);
  const [sub, setSub] = React.useState<Subscription | null>(null);
  const history = useHistory();

  const reconnect = () => {
    if (sub) sub.unsubscribe();
    if (ctx.state !== 'running') ctx.resume();
    const curSub = interval(50).subscribe(() => {
      if (ctx.currentTime !== 0 && ctx.state === 'running') {
        curSub.unsubscribe();
        setSub(null);
        startSession();
        history.push(SET_POS_ROUTE);
      }
    });
    setSub(curSub);
  };

  const sync = () => {
    if (sub) sub.unsubscribe();
    if (ctx.state !== 'running') ctx.resume();
    const curSub = interval(50).subscribe(() => {
      if (ctx.currentTime !== 0 && ctx.state === 'running') {
        curSub.unsubscribe();
        timer(5000).subscribe(() => setSub(null));
        client?.clock.getClock();
      }
    });
    setSub(curSub);
  };

  if (!client) {
    return (
      <Button disabled={sub !== null} onClick={reconnect}>
        {sub ? 'Loading...' : 'Reconnect'}
      </Button>
    );
  }

  if (ctx.state !== 'running') {
    return (
      <Button disabled={sub !== null} onClick={sync}>
        {sub ? 'Loading...' : 'Resume'}
      </Button>
    );
  }

  return (
    <TopButton disabled={sub !== null} onClick={sync}>
      {sub ? 'Loading...' : 'Fix timing'}
    </TopButton>
  );
};

export default SyncButton;
