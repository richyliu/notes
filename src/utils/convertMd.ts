import showdown from 'showdown';
import showdownKatex from 'showdown-katex-studdown';
import mermaid from 'mermaid';
import Prism from 'prismjs';

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

showdown.extension('prism', {
  type: 'language',
  regex: '```(?!mermaid)(.+)\\n([\\s\\S]+)\\n```',
  replace(_, langName: string, code: string) {
    // import prism theme dynamically
    // @ts-ignore
    import('prismjs/themes/prism.css').then();

    try {
      // could throw if language is not valid
      const highlighted = Prism.highlight(code, Prism.languages[langName]);
      // prism syntax highlight
      return `<pre><code class="language-${langName}">${highlighted}</code></pre>`;
    } catch (e) {
      // ignore warning
      console.error(e);

      return '';
    }
  },
});

const converter = new showdown.Converter({
  metadata: true,
  extensions: ['katex', 'mermaid', 'prism'],
});
converter.setFlavor('github');

/**
 * Converts a markdown string into a html string
 * @param input Markdown string input to convert
8 */
export default async function convertMd(input: string): Promise<string> {
  // search for 3 backticks followed by language name
  const languages = (input.match(/```(.+)\n/g) || [])
    .map(t => t.slice(3, t.length - 1));

  // get required prismjs languages first
  try {
    for (const language of languages) {
      console.log('prismjs/components/prism-' + language);
      await import('prismjs/components/prism-' + language);
    }
    // import language dynamically
  } catch (e) {
    console.log(e);
  }

  return converter.makeHtml(input);
}
