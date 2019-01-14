import showdown from 'showdown';

showdown.extension('tasklist-input', () => [
	{
		type: 'lang',
		regex: /- \[ \]/g,
		replace: '- <span class="bullet">x</span>',
	},
	{
		type: 'lang',
		regex: /^- [ ]/g,
		replace: '<input type="checkbox"/>',
	},
]);

const converter = new showdown.Converter({
	tasklists: true,
	tables: true,
	extensions: [ 'tasklist-input' ],
});

/**
 * Converts a markdown string into a html string
 * @param input Markdown string input to convert
 */
export default function convertMd(input: string): string {
	return converter.makeHtml(input);
}
