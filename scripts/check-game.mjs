import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const base = new URL('../games/furiko/', import.meta.url);
const manifest = JSON.parse(fs.readFileSync(new URL('manifest.json', base), 'utf8'));
assert.equal(manifest.version, 'v0.36');
assert.equal(manifest.partCount, 24);
assert.ok(Number.isInteger(manifest.totalChars) && manifest.totalChars > 0);

let html = '';
for (let i = 1; i <= manifest.partCount; i++) {
  const part = 'parts/part-' + String(i).padStart(3, '0') + '.txt';
  html += fs.readFileSync(new URL(part, base), 'utf8');
}
assert.equal(html.length, manifest.totalChars, 'Game fragments are incomplete');
assert.ok(html.startsWith('<!doctype html>'));
assert.ok(html.trimEnd().endsWith('</html>'));

const blocks = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
assert.equal(blocks.length, 21, 'Unexpected number of inline scripts');
for (const [index, block] of blocks.entries()) {
  new vm.Script(block[1], { filename: 'game-script-' + (index + 1) + '.js' });
}

const homepage = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const launcher = fs.readFileSync(new URL('../games/furiko/index.html', import.meta.url), 'utf8');
assert.ok(homepage.includes('href="games/furiko/"'));
assert.ok(launcher.includes('manifest.json'));
assert.ok(launcher.includes('document.write(game)'));
console.log('PASS: 24 game fragments, 21 script tags, homepage and launcher validated.');
