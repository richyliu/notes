import React, { useState, useEffect } from 'react';

import styled from '../../utils/theme';
import { ScrollContainer } from '../styled/layout';

import EditorInput from './editorInput';
import Render from '../render';
import MenuBar from './menuBar';

import * as Keybinder from '../../utils/keybinder';
import { NoteInfo } from '../../utils/notes';
import lsdb from '../../database/localStorageDb';

interface EditorStyledProps {
  show: boolean;
}
const EditorStyled = styled.div`
  display: ${(p: EditorStyledProps) => (p.show ? 'block' : 'none')};
  flex: 0 1 auto;
`;
const MenuBarStyled = styled.div`flex: 0 0 10px;`;

interface EditorWrapperProps {
  note: NoteInfo;
}
const EditorWrapper: React.FC<EditorWrapperProps> = ({ note }) => {
  const [html, setHtml] = useState<string>('');
  const [val, setVal] = useState<string>('');

  // get current note
  useEffect(
    () => {
      lsdb.getNote(note.id).then(newNote => newNote && setVal(newNote.content));
    },
    [note, setVal]
  );

  // bind key events
  useEffect(
    () =>
      Keybinder.bind(action => {
        switch (action) {
          case 'toggle-editor-view':
            if (html !== '') setHtml('');
            else setHtml(val);
            break;
        }
      }),
    [html, setHtml]
  );

  // focus on element when coming back
  useEffect(
    () => {
      const ta = document.querySelector('.CodeMirror textarea') as HTMLElement;
      if (ta) ta.focus();
    },
    [html]
  );

  // save to db only when necessary (after no changes for 2 seconds)
  const throttle = 2000;
  useEffect(() => {
    const timer = setTimeout(
      () => lsdb.setNote(note.id, { info: note, content: val }),
      throttle
    );
    return () => clearTimeout(timer);
  });

  return (
    <ScrollContainer>
      <MenuBarStyled>
        <MenuBar />
      </MenuBarStyled>
      <EditorStyled show={html === ''}>
        <EditorInput value={val} onChange={setVal} />
      </EditorStyled>
      <EditorStyled show={html !== ''}>
        <Render html={html} />
      </EditorStyled>
    </ScrollContainer>
  );
};

export default EditorWrapper;
