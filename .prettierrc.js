// many settings below copied from my default pettier setting
module.exports = {
  // Include parentheses around a sole arrow function parameter
  arrowParens: 'always',

  // Controls the printing of spaces inside object literals
  bracketSpacing: true,

  // Control whether Prettier formats quoted code embedded in the file.
  embeddedLanguageFormatting: 'auto',

  // Specify the end of line used by prettier
  endOfLine: 'auto',

  // Specify the global whitespace sensitivity for HTML files.
  //  Valid options:
  // - `css` - Respect the default value of CSS display property.
  // - `strict` - Whitespaces are considered sensitive.
  // - `ignores` - Whitespaces are considered insensitive.
  htmlWhitespaceSensitivity: 'css',

  // If true, puts the `>` of a multi-line jsx element at the end of the last line instead of being alone on the next line
  // jsxBracketSameLine: true,
  bracketSameLine: true,

  // Use single quotes instead of double quotes in JSX
  jsxSingleQuote: true,

  // Fit code within this line limit
  printWidth: 80,

  // (Markdown) wrap prose over multiple lines
  proseWrap: 'preserve',

  // Change when properties in objects are quoted
  quoteProps: 'as-needed',

  // Whether to add a semicolon at the end of every line
  semi: false,

  // If true, will use single instead of double quotes
  singleQuote: true,

  // Number of spaces it should use per tab
  tabWidth: 2,

  // Controls the printing of trailing commas wherever possible. Valid options:
  // - `none` - No trailing commas
  // - `es5` - Trailing commas where valid in ES5 (objects, arrays, etc)
  // - `all` - Trailing commas wherever possible (function arguments)
  trailingComma: 'all',

  // Indent lines with tabs
  useTabs: false,
}
