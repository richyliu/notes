import React from 'react';

import { Columns } from 'react-bulma-components/full';

import NoteMenu from './note-menu/NoteMenu';
import EditorWrapper from './editor/EditorWrapper';

const App: React.FunctionComponent = () => {
  return (
    <div>
      <Columns>
        <Columns.Column size={3}>
          <NoteMenu />
        </Columns.Column>
        <Columns.Column>
          <EditorWrapper />
        </Columns.Column>
      </Columns>
    </div>
  );
};

export default App;
