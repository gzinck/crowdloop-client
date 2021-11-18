import React from 'react';
import { useHistory } from 'react-router';
import styled from 'styled-components';
import { AudiencePos } from '../../client/AudienceAPI';
import APIContext from '../../contexts/APIContext';
import LoopContext from '../../contexts/LoopContext';
import useOnClick from '../../hooks/useOnClick';
import { GET_STARTED_ROUTE, LOOP_BOARD_ROUTE } from '../../routes';
import theme from '../../theme';
import Background from '../generic/Background';
import Button from '../generic/Button';
import Cookies from 'js-cookie';

const locationCookieKey = 'position-in-room';

const grayLevel = 255;
const Square = styled.div`
  height: min(80vw, 70vh);
  width: min(80vw, 70vh);
  max-width: 30rem;
  max-height: 30rem;
  background-color: rgba(${grayLevel}, ${grayLevel}, ${grayLevel}, 0.1);
  position: relative;
`;

const posSize = '10%';
const CurPosition = styled.div.attrs((pos: AudiencePos) => ({
  style: {
    top: `calc(${pos.y * 100}% - ${posSize} / 2)`,
    left: `calc(${pos.x * 100}% - ${posSize} / 2)`,
  },
}))<AudiencePos>`
  background-color: ${theme.palette.primary.default};
  position: absolute;
  height: ${posSize};
  width: ${posSize};
  border-radius: 50%;
`;

const Stage = styled.div`
  position: absolute;
  left: 25%;
  top: 0;
  background-color: ${theme.palette.background.light};
  height: 10%;
  max-height: 50px;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  & > p {
    opacity: 0.5;
  }
`;

const Text = styled.p`
  color: ${theme.palette.background.contrastText};
  text-align: center;
  width: min(80vw, 70vh);
  max-width: 30rem;
  box-sizing: border-box;
  padding: 1rem;
`;

const DoneButton = styled(Button)`
  margin: 1rem;
`;

const PositionChooser = (): React.ReactElement => {
  const ref = React.useRef<HTMLDivElement>(null);
  const history = useHistory();
  const [pos, setPos] = React.useState({ x: 0.5, y: 0.5 });
  const { setPosition } = React.useContext(LoopContext);
  const { client } = React.useContext(APIContext);

  React.useEffect(() => {
    const position = Cookies.get(locationCookieKey);
    if (position) setPos(JSON.parse(position));
  }, []);

  React.useEffect(() => {
    if (!client) history.push(GET_STARTED_ROUTE);
  }, [client, history]);

  const onClick = React.useCallback((event: MouseEvent | TouchEvent) => {
    if (ref.current) {
      const box = ref.current.getBoundingClientRect();

      let clientBox;
      if (event instanceof MouseEvent) {
        clientBox = { x: event.clientX, y: event.clientY };
      } else {
        clientBox = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }

      setPos({
        x: (clientBox.x - box.x) / box.width,
        y: (clientBox.y - box.y) / box.height,
      });
    }
  }, []);
  useOnClick(ref, onClick);

  return (
    <Background>
      <Text>
        Tap in the box below to select where you are in the room. Then, scroll down and click
        &quot;Done.&quot;
      </Text>
      <Square ref={ref}>
        <Stage>
          <Text>Performer</Text>
        </Stage>
        <CurPosition {...pos} />
      </Square>
      <DoneButton
        onClick={() => {
          setPosition(pos);
          Cookies.set(locationCookieKey, JSON.stringify(pos), { expires: 1 });
          history.push(LOOP_BOARD_ROUTE);
        }}
      >
        Done
      </DoneButton>
    </Background>
  );
};

export default PositionChooser;
