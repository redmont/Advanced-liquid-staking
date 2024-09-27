// This configuration only applies to the package manager root.
/** @type {import("eslint").Linter.Config} */
module.exports = {
  ignorePatterns: [
    'apps/**',
    // Ignore dotfiles
    '.*.js',
    'node_modules/',
    'dist/',
  ],
  extends: [
    '@repo/eslint-config/library.js',
    'eslint:recommended',
    'prettier',
    'eslint-config-turbo',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  plugins: ['only-warn'],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  overrides: [
    {
      files: ['*.js?(x)', '*.ts?(x)'],
    },
  ],
};
