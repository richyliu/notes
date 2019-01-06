import { Plugin } from 'slate-react';
import { Editor, Mark } from 'slate';

// mapping from block shortcut to type
const blocks = new Map([
  ['*', 'list-item'],
  ['-', 'list-item'],
  ['+', 'list-item'],
  ['>', 'block-quote'],
  ['#', 'heading1'],
  ['##', 'heading2'],
  ['###', 'heading3'],
  ['####', 'heading4'],
  ['#####', 'heading5'],
  ['######', 'heading6'],
]);
// mapping from mark shortcut to type
const marks = new Map([
  ['**', 'bold'],
  ['*', 'italic'],
  ['__', 'underline'],
  ['~~', 'deleted'],
  ['`', 'code'],
]);

function isBlock(type: string): boolean {
  return getBlockShortcut(type) !== '';
}
function getBlockType(chars: string): string | void {
  return blocks.get(chars);
}
function getBlockShortcut(type: string): string {
  return ([...blocks.entries()].find(([_, val]) => val === type) || [''])[0];
}
function getMarkType(chars: string): string | void {
  return marks.get(chars);
}

/**
 * Check if a block shortcut should be converted to a block (#, ##, ###, 1., -,
 * etc.) and do the necessary conversion
 */
function triggerBlock(event: KeyboardEvent, editor: Editor, next: () => any) {
  const { value } = editor;
  // only apply shortcut on a paragraph block
  if (value.startBlock.type !== 'paragraph') return next();

  // get shortcut type according to block text up to cursor
  const blockType = getBlockType(
    value.startBlock.text.slice(0, value.selection.start.offset)
  );
  // if shortcut was a block modifier
  if (blockType) {
    editor.setBlocks(blockType);
    // remove shortcut text from block
    editor.withoutSaving(() => editor.moveFocusToStartOfBlock().delete());
    // prevent space from propagating
    event.preventDefault();
  } else {
    return next();
  }
}

/**
 * Remove block shortcut into its trigger (opposite of triggerBlocn)
 */
function removeBlock(event: KeyboardEvent, editor: Editor, next: () => any) {
  const { value } = editor;

  // if is a block activated by a shortcut and at start of line
  if (isBlock(value.startBlock.type) && value.selection.start.offset === 0) {
    // change back to paragraph
    editor.setBlocks('paragraph');
    // insert the shortcut back followed by space
    editor.insertText(getBlockShortcut(value.startBlock.type) + ' ');
    // prevent backspace from propagating
    event.preventDefault();
  } else {
    return next();
  }
}

/**
 * Toggle a inline mark, ex: * = bold, ** = italics, ` = code
 */
function toggleInline(event: KeyboardEvent, editor: Editor, next: () => any) {
  const { value } = editor;

  // last one or two characters (without whitespace)
  const lastTwo = value.startBlock.text.slice(-2).trim();
  const mark = getMarkType(lastTwo);
  // mark exists and event key corresponds with last char of mark
  if (mark && lastTwo.slice(-1) === event.key) {
    editor.toggleMark(mark);
  } else {
    return next();
  }
}

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

export default function MarkdownPreviewPlugin() {
  return {
    onKeyDown(event: KeyboardEvent, editor, next) {
      switch (event.key) {
        case ' ':
          return triggerBlock(event, editor, next);
        case 'Backspace':
          return removeBlock(event, editor, next);
        case 'Ó':
          // alt-shift-h: delete a word
          return backspaceWord(event, editor);
        case '˙':
          // alt-h: delete a letter
          editor.deleteBackward(1);
          event.preventDefault();
        default:
          return toggleInline(event, editor, next);
      }
    },
  } as Plugin;
}
