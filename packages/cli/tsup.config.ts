import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'], 
  dts: false,
  clean: true,
  sourcemap: false,
  minify: false,
  splitting: false,
  treeshake: true,
  target: 'node18',
  external: ['@rta/core', '@rta/analyzer-web', '@rta/claude-integration'],
  banner: {
    js: '#!/usr/bin/env node',
  },
  outExtension: ({ format }) => ({
    js: '.js', // Mantener .js para compatibilidad con package.json
  }),
  onSuccess: process.platform === 'win32' ? undefined : 'chmod +x dist/index.js',
});
