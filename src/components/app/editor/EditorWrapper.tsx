import React, { useState } from 'react';

import styled from 'styled-components';
import { Button } from 'reactstrap';

import Editor from 'draft-js-plugins-editor';
import createMarkdownShortcutsPlugin from 'draft-js-markdown-shortcuts-plugin';
import {
  EditorState,
  getDefaultKeyBinding,
  DraftHandleValue,
  ContentState,
  convertFromRaw,
  RichUtils,
} from 'draft-js';

import 'src/styles/checkableList.css';

const plugins = [createMarkdownShortcutsPlugin()];

const Title = styled.span`
  font-size: 1.5em;
  color: violet;
`;

/**
 * Binds keys to actions within the draft js editor
 */
function keyBindingFn(e: React.KeyboardEvent): string | null {
  switch (e.key) {
    case 'ß':
      // alt-s
      return 'myeditor-save';
    case '˙':
      // alt-h
      return 'backspace';
    case '∑':
      // alt-w
      return 'backspace-word';
    case '≥':
      // alt-.
      return 'myeditor-indent';
    case '≤':
      // alt-,
      return 'myeditor-outdent';
  }
  return getDefaultKeyBinding(e);
}

const EditorWrapper: React.FunctionComponent = () => {
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createWithContent(
      convertFromRaw(
        JSON.parse(`{"blocks":[{"key":"a92n","text":"helloa foo ","type":"unstyled","depth":0,"inlineStyleRanges":[{
          "offset":7,"length":3,"style":"CODE"}],"entityRanges":[],"data":{}},{"key":"32uot","text":"bar","type":
          "header-one","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"9i2md","text":"baz","type"
          :"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"1peoo","text":"foo","type":
          "checkable-list-item","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"checked":true}}],
          "entityMap":{}}`)
      )
    )
  );
  // console.log(convertToRaw(editorState.getCurrentContent()));

  /**
   * Handles the commands like saving, deleting, etc.
   */
  function handleKeyCommand(command: string): DraftHandleValue {
    console.log(command);
    switch (command) {
      case 'myeditor-save':
        alert('save');
        return 'handled';
      case 'myeditor-indent':
        const newState = RichUtils.onTab(
          {
            preventDefault: () => {},
            shiftKey: false,
          } as React.KeyboardEvent,
          editorState,
          4
        );
        console.log(newState == editorState);
        setEditorState(newState);
        return 'handled';
    }
    return 'not-handled';
  }

  return (
    <div>
      <p>
        <Title>editor wrapper</Title>
      </p>
      <Button color="danger">Danger!</Button>
      <Editor
        editorState={editorState}
        onChange={setEditorState}
        plugins={plugins}
        keyBindingFn={keyBindingFn}
        handleKeyCommand={handleKeyCommand}
      />
    </div>
  );
};

export default EditorWrapper;
