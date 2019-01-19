const codemirror: CodeMirror.EditorConfiguration = {
	mode: 'markdown',
	theme: 'monokai',
	indentUnit: 4,
	indentWithTabs: true,
	lineWrapping: true,
	lineNumbers: true,
	extraKeys: {
		'Cmd-Backspace': cm => cm.execCommand('delWordBefore'),
		'Alt-Z': cm => cm.execCommand('undo'),
		'Shift-Alt-Z': cm => cm.execCommand('redo'),
		'Shift-Alt-W': cm =>
			cm.setOption('lineWrapping', !cm.getOption('lineWrapping')),
		'Alt-L': cm => {
			// TODO: make this work on mobile
			const line = Number(prompt('Line number', ''));
			if (!isNaN(line)) cm.getDoc().setCursor(line - 1, 0);
		},
		'Cmd-C': () => alert('hi'),
	},
};

export type Action = string;
interface Shortcut {
	altKey?: boolean;
	metaKey?: boolean;
	ctrlKey?: boolean;
	key?: string;
}
/**
 * Defines what keyboard shortcuts(s) should be converted to an action
 * WINDOW, LINUX, AND MAC not currently implemented!
 */
interface KeyAction {
	windows?: Shortcut;
	linux?: Shortcut;
	mac?: Shortcut;
	ios?: Shortcut;
	action: Action;
}
export type KeyActions = KeyAction[];

const shortcuts: KeyActions = [
	{
		ios: { key: 'µ' },
		linux: { key: 'm', altKey: true },
		action: 'toggle-editor-view',
	},
];

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
	codemirror,
	codemirrorKeyDown: (cm, e) => {
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
	shortcuts,
};
