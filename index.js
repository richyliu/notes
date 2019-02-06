import { Elm } from './src/Main.elm';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/markdown/markdown';


const app = Elm.Main.init({
    node: document.getElementById("main")
});

window.app = app;


CodeMirror.commands['my-md'] = () => console.log('arst');
let editor = CodeMirror(document.getElementById('editor-wrapper'), {
  value: '# foo\nbar',
  mode: 'markdown',
  theme: 'monokai',
  indentUnit: 4,
  indentWithTabs: true,
  lineWrapping: true,
  extraKeys: {
    'Cmd-Backspace': 'delWordBefore',
    'Alt-Z': 'undo',
    'Shift-Alt-Z': 'redo',
    'Alt-F': 'find',
    'Shift-Alt-W': cm =>
      cm.setOption('lineWrapping', !cm.getOption('lineWrapping')),
    'Alt-L': cm => {
      // TODO: make this work on mobile
      const line = Number(prompt('Line number', ''));
      if (!isNaN(line)) cm.getDoc().setCursor(line - 1, 0);
    },
    'µ': 'my-md'
  },
});
editor.on('change', cm => app.ports.editorChanged.send(cm.getValue()));

app.ports.send.subscribe(({type_: type, data}) => {
  switch(type) {
    case 'set_content':
      editor.doc.setValue(data);
  }
});

window.editor = editor;
