import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  treeshake: true,
  target: 'node18',
  external: ['@rta/core'],
  outExtension: ({ format }) => ({
    js: format === 'esm' ? '.js' : '.cjs', // ESM como .js, CJS como .cjs
  }),
});
