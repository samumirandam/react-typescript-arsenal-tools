import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // Solo el punto de entrada principal
  format: ['esm'], // CLI needs to be ESM for chalk v5
  dts: false, // CLI doesn't need type definitions
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
  onSuccess: 'chmod +x dist/index.js',
});
