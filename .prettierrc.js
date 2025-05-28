module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  quoteProps: 'as-needed',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  insertPragma: false,
  requirePragma: false,
  overrides: [
    { files: '*.json', options: { printWidth: 80 } },
    { files: '*.md', options: { printWidth: 80, proseWrap: 'always' } },
  ],
};
