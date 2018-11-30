import React from 'react';

import NoteMenuNavbar from './NoteMenuNavbar';
import NotesList from './NotesList';

const NoteMenu: React.FunctionComponent = () => {
  return (
    <div>
      <NoteMenuNavbar/>
      <NotesList/>
    </div>
  );
};

export default NoteMenu;
