import React from 'react';
import { navigate } from 'gatsby';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/markdown/markdown';
import { load, save } from '../database/notes';
import convertMd from '../utils/convertMd';
import config from '../utils/config';

const Editor: React.FC = () => (
	<div>
		<CodeMirror
			value={load()}
			onChange={(_, __, value) => save(value)}
			options={{
				...config.codemirror.options,
				extraKeys: {
					'Cmd-Backspace': cm => cm.execCommand('delWordBefore'),
					'Alt-Z': cm => cm.execCommand('undo'),
					'Shift-Alt-Z': cm => cm.execCommand('redo'),
					'Alt-M': cm =>
						navigate(`/render?html=${convertMd(cm.getValue())}`),
				},
			}}
			onKeyDown={config.codemirror.onKeyDown}
		/>

		<div id="dmermaid" />
	</div>
);

export default Editor;
