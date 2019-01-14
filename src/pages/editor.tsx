import React from 'react';
import { navigate } from 'gatsby';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/markdown/markdown';
import { load, save } from '../database/notes';
import convertMd from '../utils/convertMd';

const Editor: React.FC = () => (
	<div>
		<CodeMirror
			value={load()}
			options={{
				mode: 'markdown',
				theme: 'monokai',
				indentUnit: 4,
				indentWithTabs: true,
				extraKeys: {
					'Cmd-Backspace': cm => cm.execCommand('delWordBefore'),
					'Alt-Z': cm => cm.execCommand('undo'),
					'Shift-Alt-Z': cm => cm.execCommand('redo'),
					'Alt-M': cm =>
						navigate(`/render?html=${convertMd(cm.getValue())}`),
				},
			}}
			onKeyDown={(cm, e) => {
				// unindent if backspace is pressed in list
				if ((e as KeyboardEvent).key == 'Backspace') {
					const cursor = cm.getCursor();
					const token = cm.getTokenAt(cursor);
					// token starts at beginning of line and only has tabs
					if (token.start == 0 && /^\t+$/.test(token.string)) {
						cm.indentLine(cursor.line, 'subtract');
						(e as KeyboardEvent).preventDefault();
					}
				}
			}}
			onChange={(_, __, value) => save(value)}
		/>
		<p />
	</div>
);

export default Editor;
