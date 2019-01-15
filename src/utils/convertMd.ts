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
	replace(match, $1) {
		try {
			const svg = mermaid.render('mermaid', $1, () => {});
			return `<div class="mermaid">${svg}</div>`;
		} catch (e) {
			console.error(e);
			return `<p class="text-red">[mermaid error: ${e.message}]</p>`;
		}
	},
});

const converter = new showdown.Converter({
	metadata: true,
	extensions: [ showdownHighlight, 'katex', 'mermaid' ],
});
converter.setFlavor('github');

/**
 * Converts a markdown string into a html string
 * @param input Markdown string input to convert
8 */
export default function convertMd(input: string): string {
	return converter.makeHtml(input);
}
