//@ts-check

import eslint from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js', '*.mjs', 'src/run.js'],
          defaultProject: 'tsconfig.json'
        },
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/no-extraneous-class': [
        'error',
        {
          allowWithDecorator: true
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          caughtErrors: 'none'
        }
      ]
    }
  },
  globalIgnores(['dist/*']),
  eslintPluginPrettier
);
