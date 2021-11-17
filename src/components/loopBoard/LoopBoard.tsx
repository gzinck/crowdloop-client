import React from 'react';
import styled from 'styled-components';
import LoopContext from '../../contexts/LoopContext';
import theme from '../../theme';
import LoopDisk from './loopDisk/LoopDisk';
import Background from '../generic/Background';
import SyncButton from './SyncButton';

const P = styled.p`
  color: ${theme.palette.background.contrastText};
  opacity: 0.5;
  max-width: 500px;
  width: 80%;
  text-align: center;
`;

const LoopBoard = (): React.ReactElement => {
  const loopCtx = React.useContext(LoopContext);
  const loops = Object.entries(loopCtx.loops).filter(([, loop]) => !loop.isMuted && !loop.stopped);
  return (
    <Background>
      <SyncButton />
      {loops.length === 0 && <P>Waiting...</P>}
      {loops.map(([id]) => (
        <LoopDisk loopId={id} key={id} />
      ))}
    </Background>
  );
};

export default LoopBoard;
