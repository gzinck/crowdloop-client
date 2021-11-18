import React from 'react';
import styled from 'styled-components';
import Link, { LinkVariant } from '../generic/Link';
import Background from '../generic/Background';

const Text = styled.p`
  text-align: center;
  max-width: 400px;
`;

const SurveyPage = (): React.ReactElement => {
  return (
    <Background>
      <Text>
        Woo! Thanks for trying out CrowdLoop. Now, if you have 5 minutes, click the button below to
        participate in a survey for my research!
      </Text>
      <Link href="https://uwaterloo.ca1.qualtrics.com/jfe/form/SV_byjIz1z7NQscWLI">
        Go To Survey
      </Link>
      <Link variant={LinkVariant.SECONDARY} href="/">
        Restart
      </Link>
    </Background>
  );
};

export default SurveyPage;
