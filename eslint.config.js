import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // A provider and the hook that reads its context belong in one file. The
    // rule is about fast refresh only: these modules full-reload instead.
    files: [
      'src/**/*-context.tsx',
      'src/lib/hooks/use-theme.tsx',
      'src/ui/toast.tsx',
    ],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
