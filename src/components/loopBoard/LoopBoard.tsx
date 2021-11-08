import React from 'react';
import styled from 'styled-components';
import LoopContext from '../../contexts/LoopContext';
import theme from '../../theme';
import LoopDisk from './loopDisk/LoopDisk';
import Background from '../generic/Background';

const P = styled.p`
  color: ${theme.palette.background.contrastText};
  max-width: 500px;
  width: 80%;
  text-align: center;
`;

const LoopBoard = (): React.ReactElement => {
  const loopCtx = React.useContext(LoopContext);
  const loops = Object.entries(loopCtx.loops).filter(([, loop]) => !loop.isMuted && !loop.stopped);

  return (
    <Background>
      {loops.length === 0 && <P>Waiting for something awesome to happen...</P>}
      {loops.map(([id]) => (
        <LoopDisk loopId={id} key={id} />
      ))}
    </Background>
  );
};

export default LoopBoard;
