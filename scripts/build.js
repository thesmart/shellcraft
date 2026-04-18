#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const MAX_DEPTH = 5;
const IMPORT_RE = /(?<=^|[\s(\[])@(\S+\.md)/g;

function expandPath(p) {
  if (p === '~') return os.homedir();
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2));
  return p;
}

function resolveImport(importPath, fromFile) {
  const expanded = expandPath(importPath);
  if (path.isAbsolute(expanded)) return expanded;
  return path.resolve(path.dirname(fromFile), expanded);
}

function processFile(filePath, depth) {
  if (depth > MAX_DEPTH) {
    throw new Error(`maximum import depth (${MAX_DEPTH}) exceeded at ${filePath}`);
  }
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new Error(`cannot read ${filePath}: ${err.message}`);
  }
  return content.replace(IMPORT_RE, (_match, importPath) => {
    const resolved = resolveImport(importPath, filePath);
    return processFile(resolved, depth + 1);
  });
}

function main() {
  const input = process.argv[2];
  if (!input) {
    console.error('usage: build.js <input.md>');
    process.exit(1);
  }
  const absInput = path.resolve(expandPath(input));
  try {
    process.stdout.write(processFile(absInput, 0));
  } catch (err) {
    console.error(`error: ${err.message}`);
    process.exit(1);
  }
}

main();
