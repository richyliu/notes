import React from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/markdown/markdown';
import config from '../../utils/config';
import styled from '../../utils/theme';

const EditorInputStyled = styled.div`
  & .CodeMirror {
    height: auto;
  }
`;

interface EditorInputProps {
  value: string;
  onChange: (val: string) => void;
}

const EditorInput: React.FC<EditorInputProps> = ({ value, onChange }) => (
  <EditorInputStyled>
    <CodeMirror
      value={value}
      onBeforeChange={(_, __, value) => onChange(value)}
      options={config.codemirror}
      onKeyDown={config.codemirrorKeyDown}
    />
  </EditorInputStyled>
);

export default EditorInput;
