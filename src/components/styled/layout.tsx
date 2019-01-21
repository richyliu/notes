import styled from '../../utils/theme';

export const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ScrollContainer = styled(FlexContainer)`
  height: 100vh;
  overflow-y: scroll;
`;
