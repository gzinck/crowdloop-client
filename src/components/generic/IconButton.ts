import styled from 'styled-components';
import theme from '../../theme';

interface Styles {
  size?: string;
}

const IconButton = styled.button.attrs((styles: Styles) => ({
  style: {
    height: styles.size || '4rem',
    width: styles.size || '4rem',
  },
}))<Styles>`
  border-radius: 50%;
  padding: 1rem;
  border: none;
  margin: 0.5rem;
  background-color: ${theme.palette.primary.dark};
  transition: background-color 0.1s;
  &:hover {
    background-color: ${theme.palette.primary.light};
    cursor: pointer;
  }
`;

export default IconButton;
