import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'eslint.config.js'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      // Deliberately NOT spreading eslint-plugin-react-hooks's `recommended`
      // config here - as of v7 that's the React Compiler rule set (adds
      // ~14 error-level rules like set-state-in-effect/static-components),
      // which flags this project's own useFetch-hook pattern. Only the two
      // classic hooks rules are enabled on purpose.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/prop-types': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['**/*.test.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  prettier,
];
