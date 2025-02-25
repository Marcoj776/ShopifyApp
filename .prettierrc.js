/** @type {import("prettier").Options} */
// prettier-ignore

const config = {
	bracketSameLine: false,
	bracketSpacing: true,
	embeddedLanguageFormatting: 'auto',
	endOfLine: 'lf',
	htmlWhitespaceSensitivity: 'css',
	insertPragma: false,
	printWidth: 80,
	proseWrap: 'always',
	quoteProps: 'as-needed',
	requirePragma: false,
	semi: false,
	singleAttributePerLine: false,
	singleQuote: true,
	tabWidth: 2,
	trailingComma: 'all',
	useTabs: true,
	overrides: [
		{
			files: ['**/package.json'],
			options: {
				useTabs: false,
			},
		},
		{
			files: ['**/*.mdx'],
			options: {
				proseWrap: 'preserve',
				htmlWhitespaceSensitivity: 'ignore',
			},
		},
	],
	plugins: ['prettier-plugin-tailwindcss'],
	tailwindAttributes: ['class', 'className', 'ngClass', '.*[cC]lassName'],
	tailwindFunctions: ['clsx', 'cn', 'cva'],
	arrowParens: 'avoid',
	jsxSingleQuote: true,
}

export default config
