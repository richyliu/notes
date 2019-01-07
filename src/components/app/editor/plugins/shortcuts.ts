/**
 * Plugin for keyboard shortcuts specific to editor
 */
import { Plugin } from 'slate-react';
import { Editor } from 'slate';

/**
 * Deletes a word back
 */
function backspaceWord(event: KeyboardEvent, editor: Editor) {
  const { value } = editor;
  const { text } = value.startBlock;

  editor
    .moveFocusBackward(
      text.length - text.trimRight().lastIndexOf(' ', text.length - 2) - 1
    )
    .delete();
  event.preventDefault();
}

export default function ShortcutsPlugin(options?) {
  return {
    onKeyDown(event: KeyboardEvent, editor, next) {
      switch (event.key) {
        case 'Ω':
          // alt-z
          editor.undo();
          event.preventDefault();
          return false;
        case '¸':
          // alt-shift-z
          editor.redo();
          event.preventDefault();
          return false;
        case 'Backspace':
          // nothing left, don't delete anymore (ruins formatting)
          if (
            !editor.value.previousBlock &&
            editor.value.startBlock.text === ''
          ) {
            event.preventDefault();
            return false;
          }
          // backspace line: ctrl-shift-backspace
          if (event.metaKey && event.shiftKey && event.which === 8) {
            editor.moveFocusToStartOfBlock().delete();
            event.preventDefault();
            return false;
          }
          // backspace word: ctrl-h or ctrl-backspace
          if (event.metaKey) {
            backspaceWord(event, editor);
          }
          // prevent propagation with meta key on desktop
          if (
            event.metaKey &&
            navigator.userAgent.match(/(iP[a-z]+)|(android)|(webOS)/i)
          ) {
            return false;
          }
          // let next one handle it
          return next();
        default:
          // unhandled, let next one handle it
          return next();
      }
    },
  } as Plugin;
}
