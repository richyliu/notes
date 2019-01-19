import React from 'react';
import styled from '../../utils/theme';

const notes = [ 'foo', 'bar', 'baz', 'bam' ];

const NoteStyled = styled.button`
	margin: 10px 5px;
	border-radius: 20px !important;
`;

interface NoteProps {
	name: string;
}
const Note: React.FC<NoteProps> = ({ name }) => (
	<NoteStyled className="btn btn-block">{name}</NoteStyled>
);

const NotesList: React.FC = () => (
	<div>{notes.map(note => <Note name={note} />)}</div>
);

export default NotesList;
