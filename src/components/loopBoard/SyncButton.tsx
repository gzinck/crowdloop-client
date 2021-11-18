import React from 'react';
import styled from 'styled-components';
import Button from '../generic/Button';
import { interval, Subscription } from 'rxjs';
import APIContext from '../../contexts/APIContext';
import theme from '../../theme';
import SharedAudioContext from '../../contexts/SharedAudioContext';
import { useHistory } from 'react-router';
import { GET_STARTED_ROUTE } from '../../routes';

const TopBar = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 3;
  max-width: calc(100% - 2rem);
`;

const TopButton = styled(Button)`
  background-color: ${theme.palette.background.light};
  color: ${theme.palette.background.contrastText};
`;

const SyncButton = (): React.ReactElement => {
  const { client } = React.useContext(APIContext);
  const { ctx } = React.useContext(SharedAudioContext);
  const sub = React.useRef<Subscription | null>(null);
  const [loading, setLoading] = React.useState(false);
  const history = useHistory();

  // At the end, unsubscribe from anything left
  React.useEffect(() => {
    return () => sub.current?.unsubscribe();
  }, []);

  React.useEffect(() => {
    const clockSub = client?.clock.isSyncing$.subscribe((isLoading) => {
      setLoading(isLoading);
    });
    return () => clockSub?.unsubscribe();
  }, [client]);

  const reconnect = () => {
    history.push(GET_STARTED_ROUTE);
  };

  const sync = () => {
    setLoading(true);
    if (sub.current) sub.current.unsubscribe();
    if (ctx.state !== 'running') ctx.resume();
    sub.current = interval(50).subscribe(() => {
      if (ctx.currentTime !== 0 && ctx.state === 'running') {
        sub.current?.unsubscribe();
        sub.current = null;
        client?.clock.getClock();
      }
    });
  };

  if (!client) {
    return <Button onClick={reconnect}>Reset</Button>;
  }

  if (ctx.state !== 'running') {
    return (
      <Button disabled={loading} onClick={sync}>
        {loading ? 'Loading...' : 'Resume'}
      </Button>
    );
  }

  return (
    <TopBar>
      <TopButton onClick={reconnect}>Reset</TopButton>
      <TopButton disabled={loading} onClick={sync}>
        {loading ? 'Loading...' : 'Fix timing'}
      </TopButton>
    </TopBar>
  );
};

export default SyncButton;
