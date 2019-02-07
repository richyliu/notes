import { Elm } from './src/Main.elm';

import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/markdown/markdown';
import hljs from 'highlight.js';


const app = Elm.Main.init({
  node: document.getElementById('main'),
});
const send = app.ports.toElmPort.send;
const subscribe = app.ports.fromElm.subscribe;

const editorWrapper = document.getElementById('editor-wrapper');


/**
 * Maps keyboard shortcuts to elm messages. Also used for codemirror
 */
const keyboardShortcuts = {
  'Alt-M': 'toggle_markdown',
  'Ctrl-M': 'toggle_markdown',
  // char code: 181
  'Alt-µ': 'toggle_markdown',

  'Alt-P': 'toggle_markdown',
  'Ctrl-P': 'toggle_markdown',
  // char code: 960
  'Alt-π': 'toggle_markdown',
};

/**
 * Keyboard shortcuts for Codemirror only
 */
const codemirrorShortcuts = {
  'Cmd-Backspace': 'delWordBefore',
  'Alt-Z': 'undo',
  'Shift-Alt-Z': 'redo',
  'Alt-F': 'find',
  'Shift-Alt-W': 'custom-toggle_linewrapping',
};

const lsKey = 'stored_v0.0.1';


/**
 * Setup keyboard event listeners
 */
function setupKeyboard() {
  const listenMode = /(iphone|ipad)/i.test(navigator.userAgent) ? 'keypress' : 'keydown';

  document.body.addEventListener(listenMode, e => {
    // do nothing if within codemirror editor (let codemirror handle it)
    if (editorWrapper.contains(document.activeElement)) return;

    const keyStr = [
      e.shiftKey ? 'Shift-' : '',
      e.metaKey ? 'Cmd-' : '',
      e.ctrlKey ? 'Ctrl-' : '',
      e.altKey ? 'Alt-' : '',
      e.key,
    ].join('');
    console.log(`[js] key listener: ${keyStr}, code: ${e.key.charCodeAt(0)}`);
    // alert(keyStr + ' ' + e.key.charCodeAt(0));

    Object.keys(keyboardShortcuts)
      .filter(key => key.toLowerCase() === keyStr.toLowerCase())
      .forEach((key, i) => {
        send({ type_: keyboardShortcuts[key] });
        // if one or more key shortcuts triggered, prevent default
        if (i === 0) e.preventDefault();
      })
  })
}


/**
 * Setup codemirror with settings and elm syncing
 */
function setupCodemirror() {
  CodeMirror.commands['toggle_markdown'] = () => send({ type_: 'toggle_markdown' });
  CodeMirror.commands['custom-toggle_linewrapping'] =
    cm => cm.setOption('lineWrapping', !cm.getOption('lineWrapping'));

  let editor = CodeMirror(editorWrapper, {
    value: '# foo\nbar',
    mode: 'markdown',
    theme: 'monokai',
    indentUnit: 4,
    indentWithTabs: true,
    lineWrapping: true,
    lineNumbers: true,
    extraKeys: { ...keyboardShortcuts, ...codemirrorShortcuts },
  });
  // REQUIRED for syntax highlighting with Marked
  window.hljs = hljs;
  window.editor = editor;

  const stored = localStorage.getItem(lsKey) || `# foo
## sub heading

\`\`\`javascript
function foo() {}
\`\`\`

foo bar baz

foo

1. hello
1. hello
	2. hello
	3. foo
1. hello

> This is a blockquote

- [x] foo
* [x] bar
`;
  send({ type_: 'set_content', data: stored });
  editor.doc.setValue(stored);

  editor.on('change', cm => {
    const val = cm.getValue();
    // save to elm and localStorage
    send({ type_: 'set_content', data: val });
    localStorage.setItem(lsKey, val);
  });
}


/**
 * Subscribe to elm message and act accordingly
 */
function listenToElm() {
  subscribe(({ type_: type, data }) => {
    switch (type) {
      case 'set_content':
        editor.doc.setValue(data);
    }
  });
}


function main() {
  setupKeyboard();
  setupCodemirror();
  listenToElm();
}

main();