import { getTagsInfo } from './tags';

const codemirror: CodeMirror.EditorConfiguration = {
  mode: 'markdown',
  theme: 'monokai',
  indentUnit: 4,
  indentWithTabs: true,
  lineWrapping: true,
  extraKeys: {
    'Cmd-Backspace': 'delWordBefore',
    'Alt-Z': 'undo',
    'Shift-Alt-Z': 'redo',
    'Alt-F': 'find',
    'Shift-Alt-W': cm =>
      cm.setOption('lineWrapping', !cm.getOption('lineWrapping')),
    'Alt-L': cm => {
      // TODO: make this work on mobile
      const line = Number(prompt('Line number', ''));
      if (!isNaN(line)) cm.getDoc().setCursor(line - 1, 0);
    },
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
  tags: {
    default: 'All',
    token: '@tag', // Usable in urls
    prefixes: {
      tag: 'Tag',
      notebook: 'Notebook',
    },
  },
  markdownLinkPrefixes: {
    tag: '@tag',
    notebook: '@notebook',
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
  lsdb: {
    tagsKey: '___notes_tags',
    tagSeparator: '|',
    defaultTags: [
      'All',
      'Notebooks',
      'Notebooks/one',
      'Notebooks/two',
      'Tags',
      'Tags/business',
      'Tags/art',
      'Tags/business/node',
      'Tags/language',
      'Tags/language/art',
      'Tags/language/foo',
      'Extra',
      'Trash',
    ],
    defaultNote: {
      title: 'Helow rodl',
      id: '230r9strenf',
    },
    notesListKey: '___notes_list',
    defaultKey: '___notes_default',
    defaultText: '# Hello\nheo world\n\n1. foo\n2. bar\n3. baz',
  },
};
