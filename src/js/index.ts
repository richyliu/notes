// @ts-ignore
import { Elm } from '../Main.elm';
import './highlight-setup';
import setupEditor from './editor-setup';
import setupDb from './database';
import InMemory from './database/inMemory';
import Parse from './database/parse';
import LocalStorage from './database/localStorage';
import Pouch from './database/pouch';

async function main() {
  /* Initialize elm app */
  const app = Elm.Main.init({
    node: document.getElementById('main'),
  });
  window.app = app;

  /* Setup one of the databases */
  // await setupDb(app.ports.dbIn.send, app.ports.dbOut.subscribe, InMemory)
  // await setupDb(app.ports.dbIn.send, app.ports.dbOut.subscribe, Parse)
  // await setupDb(app.ports.dbIn.send, app.ports.dbOut.subscribe, LocalStorage, false);
  // await setupDb(app.ports.dbIn.send, app.ports.dbOut.subscribe, Pouch);

  /* Setup the Codemirror editor */
  setupEditor(
    app.ports.toElmPort.send,
    app.ports.setContentPort.subscribe,
    document.getElementById('editor-wrapper') as HTMLDivElement
  );
}
main();
