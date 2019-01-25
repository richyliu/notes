import React from 'react';

import { ThemeProvider } from 'styled-components';
import { theme } from '../utils/theme';

import Editor from './Editor';
import NotesViewState from '../utils/notesViewState';

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <NotesViewState.Provider>
      <Editor />
    </NotesViewState.Provider>
  </ThemeProvider>
);

export default App;
