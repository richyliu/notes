import React, { useState } from 'react';

import { ThemeProvider } from 'styled-components';
import styled, { theme } from '../utils/theme';

import EditorWrapper from '../components/editor/editorWrapper';
import MiddleBar from '../components/middle/middleBar';
import SideBar from '../components/side/sideBar';

import { Tag } from '../utils/tags';
import config from '../utils/config';
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

// lsdb.setup();

const Editor: React.FC = () => {
  const [activeTag, setActiveTag] = useState<Tag>(config.tags.default);
  const [activeNote, setActiveNote] = useState<NoteInfo>(config.lsdb.defaultNote);

  return (
    <ThemeProvider theme={theme}>
      <FlexContainer>
        <SideBarStyled>
          <SideBar />
        </SideBarStyled>
        <MiddleBarStyled>
          <MiddleBar />
        </MiddleBarStyled>
        <EditorStyled>
          <EditorWrapper note={activeNote} />
        </EditorStyled>
      </FlexContainer>
    </ThemeProvider>
  );
};

export default Editor;
