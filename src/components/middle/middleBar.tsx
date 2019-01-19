import React from 'react';
import styled from '../../utils/theme';
import MenuBar from './menuBar';
import NotesList from './notesList';

const FlexContainer = styled.div`
	display: flex;
	flex-direction: column;
	margin: 5px;
`;

const MenuBarStyled = styled.div`flex: 0 0 30px;`;

const NotesListStyled = styled.div`flex: 0 1 auto;`;

const MiddleBar: React.FC = () => (
	<FlexContainer>
		<MenuBarStyled>
			<MenuBar />
		</MenuBarStyled>
		<NotesListStyled>
			<NotesList />
		</NotesListStyled>
	</FlexContainer>
);

export default MiddleBar;
