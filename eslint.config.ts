import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended, // Core ESLint recommended rules
  ...tseslint.configs.recommended, // TypeScript-specific recommended rules
  {
    files: ['**/*.ts', '**/*.tsx'], // Apply these settings to TypeScript files
    rules: {
      // Custom TypeScript-specific rules
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.jsx'], // Apply these settings to JavaScript files
    rules: {
      // Custom JavaScript-specific rules
    },
  }
);