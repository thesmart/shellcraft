#!/usr/bin/env node

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const BUILD = path.join(__dirname, 'build.js');

function tmpDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'build-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function write(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

function run(input, env = {}) {
  return spawnSync('node', [BUILD, input], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

test('simple import replaces @path.md with file contents', (t) => {
  const dir = tmpDir(t);
  write(path.join(dir, 'a.md'), 'HELLO\n');
  write(path.join(dir, 'root.md'), 'before\n@a.md\nafter\n');
  const r = run(path.join(dir, 'root.md'));
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, 'before\nHELLO\n\nafter\n');
});

test('recursive imports are expanded', (t) => {
  const dir = tmpDir(t);
  write(path.join(dir, 'a.md'), 'A-start\n@b.md\nA-end\n');
  write(path.join(dir, 'b.md'), 'B-content\n');
  write(path.join(dir, 'root.md'), '@a.md\n');
  const r = run(path.join(dir, 'root.md'));
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /A-start[\s\S]*B-content[\s\S]*A-end/);
});

test('depth of exactly 5 is allowed', (t) => {
  const dir = tmpDir(t);
  for (let i = 1; i <= 4; i++) {
    write(path.join(dir, `l${i}.md`), `@l${i + 1}.md\n`);
  }
  write(path.join(dir, 'l5.md'), 'leaf\n');
  write(path.join(dir, 'root.md'), '@l1.md\n');
  const r = run(path.join(dir, 'root.md'));
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /leaf/);
});

test('imports beyond depth 5 error', (t) => {
  const dir = tmpDir(t);
  for (let i = 1; i <= 6; i++) {
    write(path.join(dir, `l${i}.md`), `level-${i}\n@l${i + 1}.md\n`);
  }
  write(path.join(dir, 'l7.md'), 'terminal\n');
  write(path.join(dir, 'root.md'), '@l1.md\n');
  const r = run(path.join(dir, 'root.md'));
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /maximum import depth/);
});

test('relative paths resolve from importing file, not cwd', (t) => {
  const dir = tmpDir(t);
  write(path.join(dir, 'sub', 'a.md'), '@b.md\n');
  write(path.join(dir, 'sub', 'b.md'), 'sub-b\n');
  write(path.join(dir, 'b.md'), 'root-b\n');
  write(path.join(dir, 'root.md'), '@sub/a.md\n');
  const r = run(path.join(dir, 'root.md'));
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /sub-b/);
  assert.doesNotMatch(r.stdout, /root-b/);
});

test('absolute paths are honored', (t) => {
  const dir = tmpDir(t);
  const target = path.join(dir, 'abs.md');
  write(target, 'ABS-CONTENT\n');
  write(path.join(dir, 'root.md'), `before\n@${target}\nafter\n`);
  const r = run(path.join(dir, 'root.md'));
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /ABS-CONTENT/);
});

test('~ expands to HOME', (t) => {
  const dir = tmpDir(t);
  write(path.join(dir, 'home.md'), 'HOME-CONTENT\n');
  write(path.join(dir, 'root.md'), '@~/home.md\n');
  const r = run(path.join(dir, 'root.md'), { HOME: dir });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /HOME-CONTENT/);
});

test('@ref is replaced mid-line and inside brackets/parens', (t) => {
  const dir = tmpDir(t);
  write(path.join(dir, 'x.md'), 'X');
  write(path.join(dir, 'root.md'), 'see @x.md here (@x.md) [@x.md]');
  const r = run(path.join(dir, 'root.md'));
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, 'see X here (X) [X]');
});

test('@ inside a word (email-like) is not replaced', (t) => {
  const dir = tmpDir(t);
  write(path.join(dir, 'root.md'), 'user@example.md domain');
  const r = run(path.join(dir, 'root.md'));
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout, 'user@example.md domain');
});

test('missing imported file errors with a readable message', (t) => {
  const dir = tmpDir(t);
  write(path.join(dir, 'root.md'), '@nope.md\n');
  const r = run(path.join(dir, 'root.md'));
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /cannot read/);
});

test('no argument prints usage and exits non-zero', () => {
  const r = spawnSync('node', [BUILD], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /usage/i);
});
