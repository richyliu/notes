/**
 * Setup the editor and various keyboard shortcuts
 */

import * as CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/markdown/markdown';

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

export default function setup(
  sendIn: (content: { type_: string; data: string }) => void,
  setContent: (cb: (content: string) => void) => void,
  editorWrapper: HTMLDivElement
) {
  const send = (type_: string, data = '') => sendIn({ type_, data: data });
  let editor;

  /**
   * Setup keyboard event listeners
   */
  const listenMode = /(iphone|ipad)/i.test(navigator.userAgent)
    ? 'keypress'
    : 'keydown';

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
      });
  });

  /**
   * Setup codemirror with settings and elm syncing
   */
  CodeMirror.commands['ToggleMarkdown'] = () => send('ToggleMarkdown');
  CodeMirror.commands['custom-toggle_linewrapping'] = cm =>
    cm.setOption('lineWrapping', !cm.getOption('lineWrapping'));

  editor = CodeMirror(editorWrapper, {
    value: '',
    mode: 'markdown',
    theme: 'monokai',
    indentUnit: 4,
    indentWithTabs: true,
    lineWrapping: true,
    lineNumbers: true,
    extraKeys: { ...keyboardShortcuts, ...codemirrorShortcuts },
  });

  editor.on('change', cm => send('SetContent', cm.getValue()));

  /**
   * Listen to elm requests
   */
  setContent(content => editor.doc.setValue(content));
}
