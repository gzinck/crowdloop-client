import React from 'react';
import styled from 'styled-components';
import Link from '../generic/Link';
import Background from '../generic/Background';

const Container = styled.div`
  max-width: 400px;
  padding: 10px;
`;

const SurveyPage = (): React.ReactElement => {
  return (
    <Background>
      <Container>
        <p>
          Woo! Thanks for trying out CrowdLoop. Now, if you have 5 minutes, click the button below
          to participate in a survey for my research!
        </p>
        <Link href="https://uwaterloo.ca1.qualtrics.com/jfe/form/SV_byjIz1z7NQscWLI">
          Go To Survey
        </Link>
      </Container>
    </Background>
  );
};

export default SurveyPage;
