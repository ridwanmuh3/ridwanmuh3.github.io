#!/usr/bin/env node
/**
 * Render the static Mermaid diagrams used by the project case studies.
 *
 * `src/lib/mermaid-plugin.mjs` fails the build on any remaining ```mermaid
 * fence, so diagrams are authored here as `.mmd` sources and committed as
 * pre-rendered SVG in `public/diagrams/`. The article markup then points a
 * `.mermaid-zoom` button at that SVG and repeats its intrinsic size, which is
 * what lets the lightbox reserve the frame before the file lands.
 *
 * Usage:
 *   node scripts/render-diagrams.mjs            # every source
 *   node scripts/render-diagrams.mjs cinx-en-1  # just one
 *
 * Requires Chrome at the path in `scripts/puppeteer.json`. Mermaid CLI is
 * fetched with `npx` on demand, so it stays out of package.json.
 */
import { execFile } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = fileURLToPath(new URL('..', import.meta.url));
const sources = `${root}docs/diagrams`;
const outDir = `${root}public/diagrams`;
const theme = `${root}scripts/mermaid-theme.json`;
const puppeteer = `${root}scripts/puppeteer.json`;

const only = process.argv.slice(2);
const names = (await readdir(sources))
  .filter((file) => file.endsWith('.mmd'))
  .map((file) => file.replace(/\.mmd$/, ''))
  .filter((name) => only.length === 0 || only.includes(name));

if (names.length === 0) {
  console.error('No matching .mmd sources in docs/diagrams');
  process.exit(1);
}

/** mmdc emits `width="100%"` plus a max-width style; bake in the viewBox size. */
async function normalise(file, id) {
  const svg = await readFile(file, 'utf8');
  const box = svg.match(/viewBox="([^"]+)"/)?.[1]?.split(/[\s,]+/).map(Number);
  if (!box) throw new Error(`${file}: no viewBox`);

  const width = Math.round(box[2]);
  const height = Math.round(box[3]);
  const next = svg
    .replace(/width="100%"/, `width="${width}" height="${height}"`)
    .replace(/\sstyle="max-width:[^"]*"/, '');

  await writeFile(file, next);
  return { id, width, height };
}

for (const name of names) {
  const input = `${sources}/${name}.mmd`;
  const output = `${outDir}/${name}.svg`;
  const id = `mermaid-${name}`;

  await run(
    'npx',
    [
      '--yes',
      '@mermaid-js/mermaid-cli@11',
      '-p',
      puppeteer,
      '-c',
      theme,
      '-I',
      id,
      '-i',
      input,
      '-o',
      output,
      '-b',
      'transparent',
    ],
    {
      env: { ...process.env, PUPPETEER_SKIP_DOWNLOAD: '1' },
      maxBuffer: 32 * 1024 * 1024,
    },
  );

  const { width, height } = await normalise(output, id);
  console.log(`${name.padEnd(16)} ${String(width).padStart(5)} x ${String(height).padStart(5)}  ${id}`);
}
