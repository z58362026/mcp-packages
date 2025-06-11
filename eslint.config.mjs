// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import pluginImport from 'eslint-plugin-import';

export default [
  {
    ignores: [
      'node_modules',
      'dist',
      '**/dist',
      '.eslintrc.cjs',
      'rollup.config.js',
      'commitlint.config.js',
      'packages/*/dist/',
      'apps/',
      '**/webpack.config.js',
      '**/generator/template/**',
      'packages/*/scripts/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier,
      import: pluginImport,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'no-var': 'error',
      'prefer-rest-params': 'error',
      eqeqeq: 'error',
      'no-multi-spaces': 'warn',
      'default-case': 'warn',
      'no-dupe-args': 'error',
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external', 'internal'], 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
        },
      ],
      'prettier/prettier': 'warn',
    },
  },
  {
    files: ['.eslintrc.{js,cjs}'],
    languageOptions: {
      sourceType: 'script',
    },
  },
];
