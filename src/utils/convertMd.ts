import showdown, { ShowdownExtension } from 'showdown';
import showdownHighlight from 'showdown-highlight';
import showdownKatex from 'showdown-katex-studdown';
import mermaid from 'mermaid';

import config from './config';

showdown.extension('katex', showdownKatex(config.katex));

mermaid.initialize(config.mermaid);
showdown.extension('mermaid', {
  type: 'language',
  regex: '```mermaid([^`]*)```',
  replace(_, $1: string) {
    try {
      const svg = mermaid.render('foo', $1, () => {});
      return `<div>${svg}</div>`;
    } catch (e) {
      console.error(e);
      return `<p>[mermaid error: ${e.message}]</p>`;
    }
  },
});

const converter = new showdown.Converter({
  metadata: true,
  extensions: [showdownHighlight, 'katex', 'mermaid'],
});
converter.setFlavor('github');

/**
 * Converts a markdown string into a html string
 * @param input Markdown string input to convert
8 */
export default function convertMd(input: string): string {
  return converter.makeHtml(input);
}
