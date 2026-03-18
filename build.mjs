#!/usr/bin/env node
import { build } from 'esbuild';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === 'development';

// Find all .ts files in src
const entryPoints = await glob('src/**/*.ts', { cwd: __dirname });

await build({
  entryPoints,
  outdir: 'lib',
  format: 'esm',
  platform: 'node',
  target: 'es2022',
  sourcemap: isDev,
  bundle: false, // Don't bundle - keep module structure
  outExtension: { '.js': '.js' },
  logLevel: 'info',
});

console.log('✓ Build complete');
