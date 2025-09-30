import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      // Allow unused variables that start with underscore
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      // Allow explicit any for now
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow require statements
      '@typescript-eslint/no-var-requires': 'off',
      // Allow non-null assertions
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  },
  {
    ignores: ['build/', 'node_modules/', '*.js', 'src/**/*.js']
  }
];