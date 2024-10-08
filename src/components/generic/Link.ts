import styled from 'styled-components';
import theme from '../../theme';

export enum LinkVariant {
  PRIMARY,
  SECONDARY,
}

interface Props {
  variant?: LinkVariant;
}

const Link = styled.a<Props>`
  text-decoration: none;
  text-align: center;
  display: block;
  clear: both;
  background-color: ${({ variant }) =>
    variant === LinkVariant.SECONDARY
      ? theme.palette.background.light
      : theme.palette.primary.default};
  color: ${theme.palette.primary.contrastText};
  padding: 0.5rem 1rem;
  border-radius: 0.4rem;
  margin: 0.3rem;
  border: none;
  font-size: 1rem;
  transition: background-color 0.1s;
  cursor: pointer;
  &:hover {
    background-color: ${theme.palette.primary.light};
  }
  &:disabled {
    cursor: not-allowed;
    background-color: ${theme.palette.primary.dark};
  }
`;

export default Link;
