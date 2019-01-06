import React from 'react';

import NoteMenu from './note-menu/NoteMenu';
import Editor from './editor/Editor';

const App: React.FC = () => {
  return (
    <div>
      <NoteMenu />
      <Editor />
    </div>
  );
};

export default App;
