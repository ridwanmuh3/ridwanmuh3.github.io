import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = (path) => readFileSync(new URL(`../dist/${path}`, import.meta.url), 'utf8');

for (const prefix of ['', 'id/']) {
  const home = page(`${prefix}index.html`);
  const list = page(`${prefix}projects/index.html`);
  const detail = page(`${prefix}projects/cinx/index.html`);
  assert.match(home, prefix
    ? /Saya membangun REST API dan layanan backend dengan Go, NestJS, dan PostgreSQL\./
    : /I build REST APIs and backend services with Go, NestJS, and PostgreSQL\./);
  const groups = [...home.matchAll(/<ul class="skills-list[^\"]*">([\s\S]*?)<\/ul>/g)];
  assert.equal(groups.length, 6);
  assert.match(groups[0][1], /<li[^>]*>Echo<\/li>/);
  assert.match(groups[2][1], /<li[^>]*>JWT<\/li>/);
  assert.doesNotMatch(groups.map((group) => group[1]).join(''), /<img|<svg|ECDSA|ML-DSA|FN-DSA/);
  assert.equal((home.match(/<h3 class="type-label text-ink-muted mb-3">/g) ?? []).length, 6);
  assert.equal((list.match(/line-clamp-2/g) ?? []).length, 5);
  assert.match(detail, /MermaidScript/);
  assert.match(detail, prefix ? /<dt class="type-meta">Periode<\/dt>/ : /<dt class="type-meta">Timeline<\/dt>/);
  assert.doesNotMatch(detail, /cdn\.jsdelivr\.net/);
  assert.doesNotMatch(page(`${prefix}blogs/hello-world/index.html`), /MermaidScript|<dt class="type-meta">Timeline<\/dt>/);
}
const sitemap = page('sitemap.xml');
assert.equal((sitemap.match(/<loc>/g) ?? []).length, 26);
assert.match(sitemap, /<loc>https:\/\/ridwanmuh3\.github\.io\/index\.xml<\/loc>/);
assert.match(page('robots.txt'), /Sitemap: https:\/\/ridwanmuh3\.github\.io\/sitemap\.xml/);
console.log('Portfolio P0 EN/ID markup and sitemap OK');
