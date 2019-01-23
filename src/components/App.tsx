import React from 'react';

import { ThemeProvider } from 'styled-components';
import { theme } from '../utils/theme';

import Editor from './Editor';

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <Editor/>
  </ThemeProvider>
);

export default App;
