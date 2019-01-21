import React from 'react';
import styled from '../../utils/theme';
import MenuBar from './menuBar';
import NotesList from './notesList';
import { ScrollContainer } from '../styled/layout';

const MenuBarStyled = styled.div`
  flex: 0 0 30px;
`;

const NotesListStyled = styled.div`
  flex: 0 1 auto;
`;

const MiddleBar: React.FC = () => (
  <ScrollContainer>
    <MenuBarStyled>
      <MenuBar />
    </MenuBarStyled>
    <NotesListStyled>
      <NotesList />
    </NotesListStyled>
  </ScrollContainer>
);

export default MiddleBar;
