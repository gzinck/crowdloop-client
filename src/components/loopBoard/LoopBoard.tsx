import React from 'react';
import styled from 'styled-components';
import LoopContext from '../../contexts/LoopContext';
import theme from '../../theme';
import LoopDisk from './loopDisk/LoopDisk';
import Background from '../generic/Background';
import SyncButton from './SyncButton';
import Snackbar from '../generic/Snackbar';
import useOnClick from '../../hooks/useOnClick';

const P = styled.p`
  color: ${theme.palette.background.contrastText};
  opacity: 0.5;
  max-width: 500px;
  width: 80%;
  text-align: center;
`;

const LoopBoard = (): React.ReactElement => {
  const { loops, randomizeColour } = React.useContext(LoopContext);
  const currLoops = Object.entries(loops).filter(([, loop]) => !loop.isMuted && !loop.stopped);

  const ref = React.useRef(null);
  useOnClick(ref, randomizeColour);

  return (
    <Background ref={ref}>
      <SyncButton />
      {currLoops.length === 0 && <P>Waiting...</P>}
      {currLoops.map(([id]) => (
        <LoopDisk loopId={id} key={id} />
      ))}
      <Snackbar
        message={
          'If you have any technical issues during the performance, try hitting the "Fix timing" or "Reset" buttons at the top of the screen.'
        }
      />
    </Background>
  );
};

export default LoopBoard;
