/**
 * Plugin for rendering markdown shortcuts
 */

import { Plugin } from 'slate-react';
import { Editor, Block } from 'slate';

// mapping from block shortcut to type
const blocks = new Map([
  ['>', 'block-quote'],
  ['#', 'heading1'],
  ['##', 'heading2'],
  ['###', 'heading3'],
  ['####', 'heading4'],
  ['#####', 'heading5'],
  ['######', 'heading6'],
]);
// mapping from mark shortcut to type (has to be two letter)
const marks = new Map([
  ['**', 'bold'],
  ['*', 'italic'],
  ['__', 'underline'],
  ['~~', 'deleted'],
  ['`', 'code'],
]);
const lists = new Map([
  ['*', 'bulleted-list'],
  ['1.', 'ordered-list'],
  ['a.', 'ordered-list-lower-alpha'],
  ['A.', 'ordered-list-upper-alpha'],
  ['i.', 'ordered-list-lower-roman'],
  ['I.', 'ordered-list-upper-roman'],
  ['-[', 'todo-list'],
]);
const listTypes = [...lists.values()];

function getBlockType(chars: string): string | void {
  return blocks.get(chars);
}
function getBlockShortcut(type: string): string {
  return ([...blocks.entries()].find(([_, val]) => val === type) || [''])[0];
}
function getMarkType(chars: string): string | void {
  return marks.get(chars) || marks.get(chars.slice(-1));
}
function getMarkShortcut(type: string): string | void {
  return ([...marks.entries()].find(([_, val]) => val === type) || [''])[0];
}
function getListType(chars: string): string | void {
  return lists.get(chars);
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
    return false;
  } else {
    return next();
  }
}

/**
 * Checks if a list should be created and creates it
 */
function initList(
  event: KeyboardEvent,
  editor: Editor,
  next: () => any,
  wrapInList: (editor: Editor, type: string) => any
) {
  const { value } = editor;
  // only apply shortcut on a paragraph block
  if (value.startBlock.type !== 'paragraph') return next();

  const listType = getListType(value.startBlock.text);
  if (listType) {
    // delete shortcut
    editor.withoutSaving(() => editor.moveFocusToStartOfBlock().delete());
    wrapInList(editor, listType);
    event.preventDefault();
    return false;
  }

  return next();
}

/**
 * Remove block shortcut into its trigger (opposite of triggerBlock)
 */
function removeBlock(event: KeyboardEvent, editor: Editor, next: () => any) {
  const { value } = editor;

  // if is heading activated by a shortcut and at start of line
  if (
    value.startBlock.type.startsWith('heading') &&
    value.selection.start.offset === 0
  ) {
    // change back to paragraph
    editor.setBlocks('paragraph');
    // insert the shortcut back followed by space
    editor.insertText(getBlockShortcut(value.startBlock.type) + ' ');
    // prevent backspace from propagating
    event.preventDefault();
    return false;
  } else {
    return next();
  }
}

/**
 * Check and trigger a inline mark, ex: bold, italics, etc.
 */
function triggerInline(event: KeyboardEvent, editor: Editor, next: () => any) {
  const { value } = editor;

  const text = value.startBlock.text.slice(0, value.selection.start.offset);
  // last two characters
  const lastTwo = text.slice(-2);
  // escaped char
  if (lastTwo === '\\*') {
    editor
      .moveBackward(1)
      .deleteBackward(1)
      .moveForward(1);
    return next();
  }

  const mark = getMarkType(lastTwo);
  console.log({ lastTwo, mark });
  // mark exists and pressed non modifier (Shift, Meta, etc.)
  if (mark && event.key.length === 1) {
    const shortcut = getMarkShortcut(mark) || '';
    const markTextLength =
      text.length - text.lastIndexOf(shortcut, text.length - 3);
    console.log(markTextLength);
    // apply mark
    editor
      .moveFocusBackward(markTextLength)
      .addMark(mark)
      .moveToEnd();
    // remove extraneous parts
    editor
      .moveFocusBackward(shortcut.length)
      .delete()
      .moveBackward(markTextLength - shortcut.length)
      .moveFocusForward(shortcut.length)
      .delete()
      .moveForward(markTextLength - shortcut.length * 2)
      .removeMark(mark);

    return false;
  } else {
    return next();
  }
}

/**
 * Backspace key actions (not necessary on mobile!)
 */
function backspace(event: KeyboardEvent, editor: Editor, next: () => any) {
  const parent = editor.value.document.getParent(
    editor.value.document.getPath(editor.value.startBlock.key)
  );
  const prevParent =
    editor.value.previousBlock &&
    editor.value.document.getParent(
      editor.value.document.getPath(editor.value.previousBlock.key)
    );
  // removes list items and jump back to previous item
  if (
    parent instanceof Block &&
    parent.type === 'list-item' &&
    prevParent instanceof Block &&
    prevParent.type === 'list-item'
  ) {
    editor.moveFocusBackward(1).delete();
    event.preventDefault();
    return false;
  }
  return removeBlock(event, editor, next);
}

function MarkdownPreviewPlugin(options: {
  wrapInList: (editor: Editor, type?: string | undefined, data?: any) => Editor;
}) {
  return {
    onKeyDown(event: KeyboardEvent, editor, next) {
      switch (event.key) {
        case ' ':
          return (
            initList(event, editor, next, options.wrapInList) ||
            triggerBlock(event, editor, next) ||
            triggerInline(event, editor, next)
          );
        case 'Backspace':
          return backspace(event, editor, next);
        case 'Tab':
          event.preventDefault();
          return next();
        default:
          return next();
      }
    },
  } as Plugin;
}

export default MarkdownPreviewPlugin;
export { listTypes };
