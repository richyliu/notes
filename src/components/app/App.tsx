import React from 'react';

import NoteMenu from './note-menu/NoteMenu';
import EditorWrapper from './editor/EditorWrapper';

const App: React.FunctionComponent = () => {
  return (
    <div>
      <NoteMenu />
      <EditorWrapper />
    </div>
  );
};

export default App;
