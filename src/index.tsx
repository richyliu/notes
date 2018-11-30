/**
 * Index file loaded by Webpack. Should remain largely the same (rendering
 * Bootstrap). Most code logic should go in Bootstrap
 */

import React from 'react';
import * as ReactDOM from 'react-dom';

import './index.scss';
import Bootstrap from './Bootstrap';

ReactDOM.render(<Bootstrap />, document.getElementById('root') as HTMLElement);

declare const module: any;
if (module.hot) {
  module.hot.accept();
}
