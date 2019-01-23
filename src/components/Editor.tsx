import React, { useState, useEffect } from 'react';

import styled from '../utils/theme';

import EditorWrapper from '../components/editor/editorWrapper';
import MiddleBar from '../components/middle/middleBar';
import SideBar from '../components/side/sideBar';

import { Tag } from '../utils/tags';
import { NoteInfo } from '../utils/notes';
import lsdb from '../database/localStorageDb';

import 'spectre.css';

const FlexContainer = styled.div`
  display: flex;
`;
const SideBarStyled = styled.div`
  flex: 0 1 300px;
`;
const MiddleBarStyled = styled.div`
  flex: 0 1 300px;
`;
const EditorStyled = styled.div`
  flex: 1 4 auto;
`;

lsdb.setup();

const Editor: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>(null as any);
  const [activeTag, setActiveTag] = useState<Tag>(null as any);
  const [notes, setNotes] = useState<NoteInfo[]>(null as any);
  const [activeNote, setActiveNote] = useState<NoteInfo>(null as any);

  useEffect(
    () => {
      lsdb.getTags().then(tags => setTags(tags));
    },
    [setTags]
  );
  useEffect(
    () => {
      if (tags) setActiveTag(tags[0]);
    },
    [setActiveNote, tags]
  );
  useEffect(
    () => {
      lsdb.getNotes([activeTag]).then(notes => setNotes(notes));
    },
    [activeTag, setNotes]
  );
  useEffect(
    () => {
      if (notes) setActiveNote(notes[0]);
    },
    [setActiveNote, notes]
  );
  console.log({ tags, notes, activeTag, activeNote });

  return (
    tags && notes && activeTag && activeNote ? (
      <FlexContainer>
        <SideBarStyled>
          <SideBar tags={tags} active={activeTag} />
        </SideBarStyled>
        <MiddleBarStyled>
          <MiddleBar />
        </MiddleBarStyled>
        <EditorStyled>
          <EditorWrapper note={activeNote} />
        </EditorStyled>
      </FlexContainer>
    ) : (
      <h1>Loading...</h1>
    )
  );
};

export default Editor;
