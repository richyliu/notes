// @ts-ignore
import {Elm} from '../Main.elm';

import './highlight-setup';
import setupEditor from './editor-setup';
import setupDb from './database';
import InMemory from './database/inMemory';
import Parse from './database/parse';


const app = Elm.Main.init({
  node: document.getElementById('main'),
});
const send = (type_, data) =>
  app.ports.toElmPort.send({type_, data: data || ''});
const subscribe = app.ports.fromElmPort.subscribe;

setupDb(app.ports.dbIn.send, app.ports.dbOut.subscribe, InMemory);
//setupDb(app.ports.dbIn.send, app.ports.dbOut.subscribe, Parse);

setupEditor(
  app.ports.toElmPort.send,
  app.ports.fromElmPort.subscribe,
  document.getElementById('editor-wrapper') as HTMLDivElement,
);

/**
 * Subscribe to elm message and act accordingly
 */
function localStorageDb() {
  const lsKey = 'stored_v0.0.1';
  subscribe(({type_: type, data}) => {
    switch (type) {
      case 'HasStorage':
        send('HasStorage', localStorage.getItem(lsKey) ? 'true' : '');
        break;
      case 'RequestStorage':
        send('ReceiveStorage', localStorage.getItem(lsKey) || '');
        break;
      case 'SetStorage':
        localStorage.setItem(lsKey, data);
        break;
      default:
        console.warn('[js]: might not be able to handle this request: ' + type);
    }
  });
}

localStorageDb();
