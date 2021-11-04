import React from 'react';
import styled from 'styled-components';
import LoopContext from '../../contexts/LoopContext';
import SharedAudioContext from '../../contexts/SharedAudioContext';
import useRefresh from '../../hooks/useRefresh';
import theme from '../../theme';
import LoopDisk from './loopDisk/LoopDisk';

const Screen = styled.div`
  width: 100%;
  min-height: 100vh;
`;

const Background = styled.div`
  width: 100%;
  padding-top: 5rem;
  min-height: calc(100vh - 5rem);
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  background-color: ${theme.palette.background.default};
`;

const LoopBoard = (): React.ReactElement => {
  const loopCtx = React.useContext(LoopContext);
  const audio = React.useContext(SharedAudioContext);
  useRefresh(20);

  return (
    <Screen>
      <Background>
        <p style={{ color: 'white', display: 'block', clear: 'both' }}>
          {Math.floor(audio.ctx.currentTime - audio.startTime.time)}
        </p>
        <p style={{ color: 'white', display: 'block', clear: 'both' }}>{audio.startTime.time}</p>
        {Object.keys(loopCtx.loops).map((id) => (
          <LoopDisk loopId={id} key={id} />
        ))}
      </Background>
    </Screen>
  );
};

export default LoopBoard;
