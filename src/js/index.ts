// @ts-ignore
import {Elm} from '../Main.elm';
import './highlight-setup';
import setupEditor from './editor-setup';
import setupDb from './database';
import InMemory from './database/inMemory';
import Parse from './database/parse';
import LocalStorage from './database/localStorage';

/* Initialize elm app */
const app = Elm.Main.init({
  node: document.getElementById('main'),
});

/* Setup one of the databases */
// setupDb(app.ports.dbIn.send, app.ports.dbOut.subscribe, InMemory);
// setupDb(app.ports.dbIn.send, app.ports.dbOut.subscribe, Parse);
setupDb(app.ports.dbIn.send, app.ports.dbOut.subscribe, LocalStorage);

/* Setup the Codemirror editor */
setupEditor(
  app.ports.toElmPort.send,
  app.ports.setContentPort.subscribe,
  document.getElementById('editor-wrapper') as HTMLDivElement,
);
