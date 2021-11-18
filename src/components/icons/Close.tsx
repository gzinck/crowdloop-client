import React from 'react';
import { defaultIconColour, defaultIconSize } from './iconDefaults';

interface Props {
  size?: string;
  colour?: string;
}

const Close = ({ size, colour }: Props): React.ReactElement => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      style={{ width: size || defaultIconSize, height: size || defaultIconSize }}
      fill={colour || defaultIconColour}
    >
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  );
};

export default Close;
