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
  extends: ['eslint:recommended', 'prettier', 'eslint-config-turbo'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json', // Provide the path to your TypeScript configuration file
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
        project: './tsconfig.json', // Again, specify the path to your TypeScript configuration file
      },
    },
  },
  overrides: [
    {
      files: ['*.js?(x)', '*.ts?(x)'],
    },
  ],
};
