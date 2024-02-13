module.exports = [
  {
    ignores: ['dist/**', 'lib/**', 'node_modules/**'],
  },
  {
    languageOptions: {
      globals: {
        module: false,
        require: false,
      },
    },
  },
  require('@eslint/js').configs.recommended,
  {
    files: ['**/*.{ts}'],
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: require('@typescript-eslint/eslint-plugin').configs.recommended.rules,
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
    },
  },
  {
    plugins: {
      'simple-import-sort': require('eslint-plugin-simple-import-sort'),
      import: require('eslint-plugin-import'),
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
    },
  },
  {
    plugins: {
      'no-only-tests': require('eslint-plugin-no-only-tests'),
    },
    rules: {
      'no-only-tests/no-only-tests': 'error',
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  require('eslint-config-prettier'),
];
