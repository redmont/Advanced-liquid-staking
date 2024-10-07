/** @type {import("eslint").Linter.Config} */
module.exports = {
  ignorePatterns: ['apps/**', '.*.js', 'node_modules/', 'dist/'],
  extends: ['eslint:recommended', 'prettier', 'turbo'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
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
        project: './tsconfig.json',
      },
    },
  },
  overrides: [
    {
      files: ['*.js?(x)', '*.ts?(x)'],
    },
  ],
};
