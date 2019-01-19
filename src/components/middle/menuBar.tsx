import React from 'react';
import  'spectre.css'
import styled from '../../utils/theme';

const FlexContainer = styled.div`
  display: flex;
`;

const InputStyled = styled.input`
  flex: 1 1 auto;
  margin: 5px;
`;

const ButtonStyled = styled.button`
  flex: 1 0 30px;
  margin: 5px;
`;

const MenuBar: React.FC = () => (
	<FlexContainer className="form-group">
		<InputStyled className="form-input" type="text" placeholder="Search..." />
		<ButtonStyled className="btn">New</ButtonStyled>
	</FlexContainer>
);

export default MenuBar;
