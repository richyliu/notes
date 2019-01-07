import React, { useState } from 'react';

import styled from 'styled-components';

import { Editor as SlateEditor } from 'slate-react';
import { Value, ValueJSON } from 'slate';
import Markdown from 'slate-md-serializer';
import EditList from '@guestbell/slate-edit-list';

import { save, load } from 'src/database/notes';
import MarkdownRenderPlugin from './plugins/markdown-render';
import MarkdownPreviewPlugin, { listTypes } from './plugins/markdown-preview';
import ShortcutsPlugin from './plugins/shortcuts';

const list = EditList({
  types: listTypes,
  typeItem: 'list-item',
});

const plugins = [
  ShortcutsPlugin(),
  MarkdownRenderPlugin(),
  MarkdownPreviewPlugin({
    wrapInList: list.changes.wrapInList,
  }),
  list,
];

const StyledEditor = styled(SlateEditor)`
  border: 3px solid black;
  padding: 5px;
  margin: 5px;
  font-family: 'verdana';
`;

const md = new Markdown();

const Editor: React.FC = () => {
  const [value, setValue] = useState<Value>(Value.fromJSON(load())
    // Value.fromJS({
    //   document: {
    //     nodes: [
    //       {
    //         object: 'block',
    //         type: 'paragraph',
    //         nodes: [
    //           {
    //             object: 'text',
    //             leaves: [
    //               {
    //                 text: 'A line of text in a paragraph. **foo bar**',
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // } as ValueJSON)
  );

  function onChange({ value: newValue }: { value: Value }) {
    if (value.document !== newValue.document) {
      console.log(newValue.document);
      save(newValue.toJSON());
      // console.log(md.serialize(newValue));
    }
    setValue(newValue);
  }

  return <StyledEditor {...{ value, plugins, onChange }} />;
};

export default Editor;
