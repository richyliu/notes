export default {
	notes: {
		token: '@note', // Usable in urls
	},
	tags: {
		token: '@tag', // Usable in urls
	},
	search: {
		tokenizer: /\s+/g,
	},
	katex: {
		throwOnError: true,
		displayMode: false,
		errorColor: '#f44336',
		delimiters: [
			{ left: '$', right: '$', display: false },
			{ left: '&&', right: '&&', display: true, asciimath: true },
		],
	},
	mermaid: {},
	codemirror: {
		options: {
			mode: 'markdown',
			theme: 'monokai',
			indentUnit: 4,
			indentWithTabs: true,
      lineWrapping: true,
      lineNumbers: true,
		},
		onKeyDown: (cm, e) => {
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
		},
	},
};
