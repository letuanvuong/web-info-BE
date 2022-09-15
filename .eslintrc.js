module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'simple-import-sort'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'no-console': [
      'warn',
      { allow: ['clear', 'info', 'error', 'dir', 'trace', 'warn'] },
    ],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    // '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'prettier/prettier': [
      'warn',
      {
        arrowParens: 'always',

        bracketSpacing: true,

        embeddedLanguageFormatting: 'auto',

        endOfLine: 'auto',

        htmlWhitespaceSensitivity: 'css',

        bracketSameLine: true,

        jsxSingleQuote: true,

        printWidth: 80,

        proseWrap: 'preserve',

        quoteProps: 'as-needed',

        semi: false,

        singleQuote: true,

        tabWidth: 2,

        trailingComma: 'all',

        useTabs: false,
      },
    ],
    'prefer-const': 'warn',
  },
}
