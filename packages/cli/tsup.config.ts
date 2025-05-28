
import { defineConfig } from 'tsup';



export default defineConfig({

  entry: {

    cli: 'src/cli.ts',

    index: 'src/index.ts'

  },

  format: ['esm'], // CLI needs to be ESM for chalk v5

  dts: false, // CLI doesn't need type definitions

  clean: true,

  sourcemap: false,

  minify: false,

  splitting: false,

  treeshake: true,

  target: 'node18',

  external: [

    '@rta/core',

    '@rta/analyzer-web', 

    '@rta/claude-integration'

  ],

  banner: {

    js: '#!/usr/bin/env node'

  },

  onSuccess: 'chmod +x dist/cli.js'

});

