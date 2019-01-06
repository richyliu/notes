import React, { useState } from 'react';

import styled from 'styled-components';

import { Editor as SlateEditor } from 'slate-react';
import { Value } from 'slate';
import Markdown from 'slate-md-serializer';

import { save, load } from 'src/database/notes';
import MarkdownRenderPlugin from './plugins/markdown-render';
import MarkdownPreviewPlugin from './plugins/markdown-preview';

const plugins = [MarkdownRenderPlugin(), MarkdownPreviewPlugin()];

const StyledEditor = styled(SlateEditor)`
  border: 3px solid black;
  padding: 5px;
  margin: 5px;
  font-family: 'verdana';
`;

const md = new Markdown();

const Editor: React.FC = () => {
  const [value, setValue] = useState<Value>(Value.fromJSON(load()));

  function onChange({ value: newValue }: { value: Value }) {
    if (value.document !== newValue.document) {
      // console.log(newValue.document);
      save(newValue.toJSON());
      // console.log(md.serialize(newValue));
    }
    setValue(newValue);
  }

  return <StyledEditor {...{ value, plugins, onChange }} />;
};

export default Editor;
