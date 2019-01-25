import React from 'react';
import styled from '../../utils/theme';
import MenuBar from './menuBar';
import NotesList from './notesList';
import { ScrollContainer } from '../styled/layout';
import { NoteInfo } from '../../utils/notes';

const MenuBarStyled = styled.div`flex: 0 0 30px;`;

const NotesListStyled = styled.div`flex: 0 1 auto;`;

interface MiddleBarProps {
  notes: NoteInfo[];
  activeNote: NoteInfo;
}
const MiddleBar: React.FC<MiddleBarProps> = ({ notes, activeNote }) => (
  <ScrollContainer>
    <MenuBarStyled>
      <MenuBar />
    </MenuBarStyled>
    <NotesListStyled>
      <NotesList notes={notes} activeNote={activeNote} />
    </NotesListStyled>
  </ScrollContainer>
);

export default MiddleBar;
