/**
 * Index file loaded by Webpack. Should remain largely the same (rendering
 * App). Most code logic should go in App
 */

import React from 'react';
import * as ReactDOM from 'react-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App';

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);

declare const module: any;
if (module.hot) module.hot.accept();
