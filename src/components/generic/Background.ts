import styled from 'styled-components';
import theme from '../../theme';

const Background = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  background-color: ${theme.palette.background.default};
`;

export default Background;
