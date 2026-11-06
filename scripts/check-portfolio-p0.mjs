import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const page = (path) => readFileSync(new URL(`../dist/${path}`, import.meta.url), 'utf8');

for (const prefix of ['', 'id/']) {
  const home = page(`${prefix}index.html`);
  const list = page(`${prefix}projects/index.html`);
  const detail = page(`${prefix}projects/cinx/index.html`);
  assert.match(home, prefix
    ? /Saya membangun REST API dan layanan backend dengan Go, NestJS, dan PostgreSQL\./
    : /I build REST APIs and backend services with Go, NestJS, and PostgreSQL\./);
  const groups = [...home.matchAll(/<ul class="skills-list[^"]*">([\s\S]*?)<\/ul>/g)];
  assert.equal(groups.length, 6);
  assert.match(groups[0][1], /<li[^>]*>Echo<\/li>/);
  assert.match(groups[2][1], /<li[^>]*>JWT<\/li>/);
  assert.doesNotMatch(groups.map((group) => group[1]).join(''), /<img|<svg|ECDSA|ML-DSA|FN-DSA/);
  assert.equal((home.match(/<h3 class="type-label text-ink-muted mb-3">/g) ?? []).length, 6);
  assert.equal((list.match(/line-clamp-2/g) ?? []).length, 5);
  assert.doesNotMatch(detail, /MermaidScript|<pre class="mermaid"/);
  assert.match(detail, prefix ? /<dt class="type-meta">Periode<\/dt>/ : /<dt class="type-meta">Timeline<\/dt>/);
  assert.doesNotMatch(detail, /cdn\.jsdelivr\.net/);
  assert.doesNotMatch(page(`${prefix}blogs/hello-world/index.html`), /MermaidScript|<dt class="type-meta">Timeline<\/dt>/);
  assert.doesNotMatch(page(`${prefix}projects/converty/index.html`), /Oct 15, 2026/);
  assert.doesNotMatch(page(`${prefix}projects/warungpos/index.html`), /<h1[^>]*>[\s\S]*?<\/h1>[\s\S]*?<h1/);
}

/**
 * Every case study ships the same three static diagrams: architecture,
 * sequence, and ERD. They are pre-rendered SVG because a leftover ```mermaid
 * fence fails the build, so the guard checks both the markup and the files.
 */
const projects = ['cinx', 'converty', 'warungpos'];
for (const prefix of ['', 'id/']) {
  const lang = prefix ? 'id' : 'en';
  for (const project of projects) {
    const detail = page(`${prefix}projects/${project}/index.html`);
    assert.equal(
      (detail.match(/class="mermaid-zoom"/g) ?? []).length,
      3,
      `${lang}/${project}: expected 3 diagrams`,
    );

    for (const i of [1, 2, 3]) {
      const name = `${project}-${lang}-${i}.svg`;
      const file = new URL(`../dist/diagrams/${name}`, import.meta.url);
      assert.ok(existsSync(file), `${name} is missing from dist`);
      assert.match(
        detail,
        new RegExp(`data-lightbox-src="/diagrams/${name.replace('.', '\\.')}"`),
        `${lang}/${project}: no lightbox trigger for ${name}`,
      );

      // The img repeats the SVG's intrinsic size so the lightbox can reserve
      // the frame before the file lands; a stale number would cause a reflow.
      const svg = readFileSync(file, 'utf8');
      const [, width, height] = svg.match(/<svg[^>]*width="(\d+)" height="(\d+)"/) ?? [];
      assert.ok(width && height, `${name}: root has no intrinsic size`);
      assert.match(
        detail,
        new RegExp(`src="/diagrams/${name.replace('.', '\\.')}" width="${width}" height="${height}"`),
        `${lang}/${project}: ${name} markup size does not match the SVG (${width}x${height})`,
      );
    }
  }
}

const sitemap = page('sitemap.xml');
assert.equal((sitemap.match(/<loc>/g) ?? []).length, 26);
assert.match(sitemap, /<loc>https:\/\/ridwanmuh3\.github\.io\/index\.xml<\/loc>/);
assert.match(page('robots.txt'), /Sitemap: https:\/\/ridwanmuh3\.github\.io\/sitemap\.xml/);
console.log('Portfolio P0 EN/ID markup and sitemap OK');
