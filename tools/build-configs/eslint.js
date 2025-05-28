module.exports = {
  root: true,
  env: { node: true, es2022: true },
  extends: ['eslint:recommended', '@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', project: true },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'no-console': 'off',
    'no-unused-vars': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'prettier/prettier': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: { jest: true, vitest: true },
      rules: { '@typescript-eslint/no-explicit-any': 'off' },
    },
    {
      files: ['**/*.config.js', '**/*.config.ts', '**/tsup.config.ts'],
      rules: { '@typescript-eslint/no-var-requires': 'off' },
    },
  ],
  ignorePatterns: ['dist/**', 'build/**', 'node_modules/**', '.next/**', 'coverage/**', '*.d.ts'],
};
