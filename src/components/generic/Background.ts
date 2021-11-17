import styled from 'styled-components';
import theme from '../../theme';

const Background = styled.div`
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 2rem;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  flex-direction: column;
  background-color: ${theme.palette.background.default};
  color: ${theme.palette.background.contrastText};
`;

export default Background;
