/**
 * Puts the entire web app together, put React Router and other high
 * level components here.
 */

import React from 'react';

import { BrowserRouter } from 'react-router-dom';

import Base from './components/Base';

const App: React.FunctionComponent = () => {
  return (
    <BrowserRouter>
      <Base />
    </BrowserRouter>
  );
};

export default App;
