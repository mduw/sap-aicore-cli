#!/usr/bin/env node
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function addJsExtensions(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await addJsExtensions(fullPath);
    } else if (entry.name.endsWith('.js')) {
      let content = await readFile(fullPath, 'utf-8');

      // Fix package.json imports - add with { type: 'json' }
      content = content.replace(
        /from\s+["'](\.\.\/package\.json)["']/g,
        'from "$1" with { type: "json" }'
      );

      // Add .js to relative imports that don't have an extension
      content = content.replace(
        /from\s+["'](\.[^"']+?)["']/g,
        (match, path) => {
          if (path.endsWith('.js') || path.endsWith('.json') || path.includes('/package.json')) {
            return match;
          }
          return match.replace(path, path + '.js');
        }
      );

      // Fix dynamic imports too
      content = content.replace(
        /import\(["'](\.[^"']+?)["']\)/g,
        (match, path) => {
          if (path.endsWith('.js') || path.endsWith('.json')) {
            return match;
          }
          return match.replace(path, path + '.js');
        }
      );

      await writeFile(fullPath, content, 'utf-8');
    }
  }
}

await addJsExtensions('lib');
console.log('✓ Added .js extensions');


