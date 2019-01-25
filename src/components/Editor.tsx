import React, { useState, useEffect, useContext } from 'react';

import styled from '../utils/theme';

import EditorWrapper from '../components/editor/editorWrapper';
import MiddleBar from '../components/middle/middleBar';
import SideBar from '../components/side/sideBar';

import { Tag } from '../utils/tags';
import { NoteInfo } from '../utils/notes';
import lsdb from '../database/localStorageDb';

import 'spectre.css';
import NotesViewState from '../utils/notesViewState';

const FlexContainer = styled.div`display: flex;`;
const SideBarStyled = styled.div`flex: 0 1 300px;`;
const MiddleBarStyled = styled.div`flex: 0 1 300px;`;
const EditorStyled = styled.div`flex: 1 4 auto;`;

// lsdb.setup();

const Editor: React.FC = () => {
  const [state, dispatch] = useContext(NotesViewState.Context);

  useEffect(
    () => {
      lsdb.getTags().then(tags => dispatch({ action: 'tags', payload: tags }));
    },
    [dispatch]
  );
  useEffect(
    () => {
      if (state.activeTag)
        lsdb
          .getNotes([state.activeTag])
          .then(notes => dispatch({ action: 'notes', payload: notes }));
    },
    [state.activeTag]
  );

  return state.tags && state.notes && state.activeTag && state.activeNote ? (
    <FlexContainer>
      <SideBarStyled>
        <SideBar tags={state.tags} active={state.activeTag} />
      </SideBarStyled>
      <MiddleBarStyled>
        <MiddleBar notes={state.notes} activeNote={state.activeNote} />
      </MiddleBarStyled>
      <EditorStyled>
        <EditorWrapper note={state.activeNote} />
      </EditorStyled>
    </FlexContainer>
  ) : (
    <h1>Loading...</h1>
  );
};

export default Editor;
