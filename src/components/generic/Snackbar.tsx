import React from 'react';
import { timer } from 'rxjs';
import styled from 'styled-components';
import theme from '../../theme';
import Close from '../icons/Close';
import IconButton from './IconButton';

interface Props {
  closeAfter?: number;
  message?: string;
}

interface MessageProps {
  open: boolean;
}

const CloseButton = styled(IconButton)`
  background-color: ${theme.palette.background.light};
  &:hover {
    background-color: ${theme.palette.background.default};
  }
`;

const Message = styled.div<MessageProps>`
  position: fixed;
  bottom: ${({ open }) => (open ? 0 : '-10rem')};
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${theme.palette.background.light};
  transition: all 0.2s;
`;

const Text = styled.p`
  text-align: center;
  max-width: 800px;
`;

const Snackbar = ({ message, closeAfter }: Props): React.ReactElement => {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(true);

    if (closeAfter) {
      const sub = timer(closeAfter).subscribe(() => setOpen(false));
      return () => sub.unsubscribe();
    }
  }, [message, closeAfter]);

  return (
    <Message open={open}>
      <Text>{message}</Text>
      <CloseButton onClick={() => setOpen(false)}>
        <Close colour={theme.palette.background.contrastText} />
      </CloseButton>
    </Message>
  );
};

export default Snackbar;
