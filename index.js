import { Elm } from './src/Main.elm';

import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/markdown/markdown';

import hljs from 'highlight.js/lib/highlight';
import apache from 'highlight.js/lib/languages/apache';
import bash from 'highlight.js/lib/languages/bash';
import cs from 'highlight.js/lib/languages/cs';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import coffeescript from 'highlight.js/lib/languages/coffeescript';
import diff from 'highlight.js/lib/languages/diff';
import xml from 'highlight.js/lib/languages/xml';
import http from 'highlight.js/lib/languages/http';
import ini from 'highlight.js/lib/languages/ini';
import json from 'highlight.js/lib/languages/json';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import makefile from 'highlight.js/lib/languages/makefile';
import markdown from 'highlight.js/lib/languages/markdown';
import nginx from 'highlight.js/lib/languages/nginx';
import objectivec from 'highlight.js/lib/languages/objectivec';
import php from 'highlight.js/lib/languages/php';
import perl from 'highlight.js/lib/languages/perl';
import properties from 'highlight.js/lib/languages/properties';
import python from 'highlight.js/lib/languages/python';
import ruby from 'highlight.js/lib/languages/ruby';
import sql from 'highlight.js/lib/languages/sql';
import shell from 'highlight.js/lib/languages/shell';
hljs.registerLanguage('apache', apache);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('cs', cs);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('css', css);
hljs.registerLanguage('coffeescript', coffeescript);
hljs.registerLanguage('diff', diff);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('http', http);
hljs.registerLanguage('ini', ini);
hljs.registerLanguage('json', json);
hljs.registerLanguage('java', java);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('makefile', makefile);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('nginx', nginx);
hljs.registerLanguage('objectivec', objectivec);
hljs.registerLanguage('php', php);
hljs.registerLanguage('perl', perl);
hljs.registerLanguage('properties', properties);
hljs.registerLanguage('python', python);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('shell', shell);


const app = Elm.Main.init({
  node: document.getElementById('main'),
});
const send = (type_, data) => app.ports.toElmPort.send({ type_, data: data || '' });
const subscribe = app.ports.fromElmPort.subscribe;

const editorWrapper = document.getElementById('editor-wrapper');

const lsKey = 'stored_v0.0.1';

let editor;

/**
 * Maps keyboard shortcuts to elm messages. Also used for codemirror
 */
const keyboardShortcuts = {
  'Alt-M': 'ToggleMarkdown',
  'Ctrl-M': 'ToggleMarkdown',
  // char code: 181
  'Alt-µ': 'ToggleMarkdown',

  'Alt-P': 'ToggleMarkdown',
  'Ctrl-P': 'ToggleMarkdown',
  // char code: 960
  'Alt-π': 'ToggleMarkdown',
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
    // console.log(`[js] key listener: ${keyStr}, code: ${e.key.charCodeAt(0)}`);
    // alert(keyStr + ' ' + e.key.charCodeAt(0));

    Object.keys(keyboardShortcuts)
      .filter(key => key.toLowerCase() === keyStr.toLowerCase())
      .forEach((key, i) => {
        send(keyboardShortcuts[key]);
        // if one or more key shortcuts triggered, prevent default
        if (i === 0) e.preventDefault();
      })
  })
}


/**
 * Setup codemirror with settings and elm syncing
 */
function setupCodemirror() {
  CodeMirror.commands['ToggleMarkdown'] = () => send('ToggleMarkdown');
  CodeMirror.commands['custom-toggle_linewrapping'] =
    cm => cm.setOption('lineWrapping', !cm.getOption('lineWrapping'));

  editor = CodeMirror(editorWrapper, {
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

  editor.on('change', cm => send('SetContent', cm.getValue()));

  window.__editor = editor;
}


/**
 * Subscribe to elm message and act accordingly
 */
function listenToElm() {
  subscribe(({ type_: type, data }) => {
    switch (type) {
      case 'SetContent':
        editor.doc.setValue(data);
        break;
      case 'HasStorage':
        send('HasStorage', localStorage.getItem(lsKey) ? 'true': '');
        break;
      case 'RequestStorage':
        send('ReceiveStorage', localStorage.getItem(lsKey) || '');
        break;
      case 'SetStorage':
        localStorage.setItem(lsKey, data);
        break;
      default:
        console.warn('[js]: unable to handle this request: ' + type);
    }
  });
}


function main() {
  setupKeyboard();
  setupCodemirror();
  listenToElm();
}

main();
