import { Elm } from './src/Main.elm';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/markdown/markdown';


const app = Elm.Main.init({
    node: document.getElementById("main")
});

window.app = app;


let editor = CodeMirror(document.getElementById('editor-wrapper'), {
  value: '# foo\nbar',
  mode: 'markdown',
  theme: 'monokai',
  indentUnit: 4,
  indentWithTabs: true,
  lineWrapping: true
});
editor.on('change', cm => app.ports.editorChanged.send(cm.getValue()));

app.ports.send.subscribe(({type_: type, data}) => {
  switch(type) {
    case 'set_content':
      editor.doc.setValue(data);
  }
});

window.editor = editor;
