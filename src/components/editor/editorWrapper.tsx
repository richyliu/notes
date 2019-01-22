import React, { useState, useEffect } from 'react';
import EditorInput from './editorInput';
import convertMd from '../../utils/convertMd';
import Render from '../render';
import * as Keybinder from '../../utils/keybinder';
import styled from '../../utils/theme';
import MenuBar from './menuBar';
import { ScrollContainer } from '../styled/layout';
import { NoteInfo } from '../../utils/notes';
import lsdb from '../../database/localStorageDb';

interface EditorStyledProps {
  show: boolean;
}
const EditorStyled = styled.div`
  display: ${(p: EditorStyledProps) => (p.show ? 'block' : 'none')};
  flex: 0 1 auto;
`;
const MenuBarStyled = styled.div`
  flex: 0 0 10px;
`;

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

  // save to db only when necessary
  const [last, setLast] = useState<number>(Number(new Date()));
  const throttle = 3000;
  useEffect(
    () => {
      if (Number(new Date()) - last > throttle) {
        lsdb.setNote(note.id, { info: note, content: val });
        setLast(Number(new Date()));
      }
    },
    [last, setLast, val]
  );

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
