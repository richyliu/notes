/**
 * Bootstraps the entire web app together, put React Router and other high
 * level components here.
 */

import React from 'react';

import { BrowserRouter } from 'react-router-dom';

import Bundle from './components/Bundle';

const Bootstrap: React.FunctionComponent = () => {
  return (
    <BrowserRouter>
      <Bundle />
    </BrowserRouter>
  );
};

export default Bootstrap;
