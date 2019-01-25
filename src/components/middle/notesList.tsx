import React, { useContext } from 'react';
import styled from '../../utils/theme';
import { NoteInfo } from '../../utils/notes';
import NotesViewState from '../../utils/notesViewState';

const NoteStyled = styled.button`
  margin: 10px 0px;
  border-radius: 20px !important;
  border: none !important;
`;

interface NoteButtonProps {
  note: NoteInfo;
}
const NoteButton: React.FC<NoteButtonProps> = ({ note }) => {
  const [state, dispatch] = useContext(NotesViewState.Context);
  return (
    <NoteStyled
      onClick={() => dispatch({ action: 'activeNote', payload: note })}
      className="btn btn-block"
    >
      {note.title}
    </NoteStyled>
  );
};

interface NotesListProps {
  notes: NoteInfo[];
  activeNote: NoteInfo;
}
const NotesList: React.FC<NotesListProps> = ({ notes, activeNote }) => (
  <div>{notes.map(note => <NoteButton note={note} key={note.id} />)}</div>
);

export default NotesList;
