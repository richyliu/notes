import React from 'react';

import NoteMenuNavbar from './NoteMenuNavbar';
import NotesList from './NotesList';

const NoteMenu: React.FC = () => {
  return (
    <div>
      <NoteMenuNavbar/>
      <NotesList/>
    </div>
  );
};

export default NoteMenu;
