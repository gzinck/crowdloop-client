import React from 'react';
import styled from 'styled-components';
import theme from '../../../theme';
import Sector from './Sector';
import useRefresh from '../../../hooks/useRefresh';
import LoopVis from './LoopVis';
import LoopContext from '../../../contexts/LoopContext';

interface Props {
  loopId: string;
}

const Disk = styled.div`
  width: 90%;
  max-width: 250px;
  padding: ${theme.padding(1)};
  display: flex;
  justify-content: center;
`;

const ShadowedSVG = styled.svg`
  -webkit-filter: drop-shadow(1px 3px 2px rgba(0, 0, 0, 0.7));
  filter: drop-shadow(1px 3px 2px rgba(0, 0, 0, 0.7));
  width: 100%;
  height: 100%;
`;

const LoopDisk = ({ loopId }: Props): React.ReactElement => {
  const loopCtx = React.useContext(LoopContext);
  const loop = loopCtx.loops[loopId];

  useRefresh(20); // Keep it up to date

  const currAngle = loop && loop.getProgress().normalized * 2 * Math.PI;

  const backgroundColour = loop.stopped
    ? theme.palette.background.light
    : theme.palette.primary.default;

  return (
    <Disk>
      <ShadowedSVG viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill={backgroundColour} />
        {/* Show a vis for the loop's contents */}
        <LoopVis radius={50} shape={loop.preview} fill={theme.palette.primary.dark} />
        {/* Show the current position in the loop with a circling cursor */}
        {currAngle !== null && (
          <Sector
            radius={50}
            angleStart={currAngle}
            angleEnd={currAngle}
            stroke={theme.palette.background.light}
            strokeWidth={2}
          />
        )}
      </ShadowedSVG>
    </Disk>
  );
};

export default LoopDisk;
