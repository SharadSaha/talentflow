import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist', 'coverage', 'node_modules'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  // The design-system library (components/ui) follows the shadcn convention of
  // co-exporting related components and their CVA variant helpers from one
  // file. The route config module co-locates lazy page components with the
  // route data structure it exports. Neither is a Fast Refresh component module,
  // so the "only export components" rule is disabled for them.
  {
    files: ['src/components/ui/**/*.{ts,tsx}', 'src/routes/route-config.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // Test files may use vitest/node globals.
  {
    files: ['**/*.{test,spec}.{ts,tsx}', 'src/test/**'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  // Disable stylistic rules that conflict with Prettier (keep this last).
  prettier,
);
