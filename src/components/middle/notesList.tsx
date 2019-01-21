import React from 'react';
import styled from '../../utils/theme';

const notes = ['foo', 'bar', 'baz', 'bam'];

const NoteStyled = styled.button`
  margin: 10px 0px;
  border-radius: 20px !important;
  border: none !important;
`;

interface NoteButtonProps {
  name: string;
}
const NoteButton: React.FC<NoteButtonProps> = ({ name }) => (
  <NoteStyled className="btn btn-block">{name}</NoteStyled>
);

const NotesList: React.FC = () => (
  <div>
    {notes.map((note, i) => (
      <NoteButton name={note} key={i} />
    ))}
  </div>
);

export default NotesList;
