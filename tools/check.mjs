#!/usr/bin/env node
// Checks the plugin's rule files (skills/, reference/, agents/) and the files around them.
// Node 18 or later, no dependencies. Run: node tools/check.mjs [--list]
// Prints one line per failure, then a summary, and exits 1 if anything failed.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LIST = process.argv.includes('--list');

let passed = 0;
const failures = [];
const ok = () => { passed++; };
const bad = (check, file, line, what) => {
  failures.push(`FAIL ${check}: ${file}${line ? ':' + line : ''} ${what}`);
};
const expect = (cond, check, file, line, what) => (cond ? ok() : bad(check, file, line, what));

const posix = (p) => p.split(sep).join('/');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const exists = (rel) => existsSync(join(ROOT, rel));

function walk(rel, filter = () => true) {
  const out = [];
  const dir = join(ROOT, rel);
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    if (name === '.git' || name === 'node_modules') continue;
    const p = join(dir, name);
    const r = posix(relative(ROOT, p));
    if (statSync(p).isDirectory()) out.push(...walk(r, filter));
    else if (filter(r)) out.push(r);
  }
  return out;
}

const ruleFiles = ['skills', 'reference', 'agents'].flatMap((d) => walk(d, (f) => f.endsWith('.md')));
const referenceNames = new Set(ruleFiles.filter((f) => f.startsWith('reference/')).map((f) => f.slice('reference/'.length)));

// Tracked text files: git when this is a clone, else every file under the folder.
function trackedTextFiles() {
  let files = null;
  if (exists('.git')) {
    try {
      const out = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
        cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
      });
      files = out.split('\0').filter(Boolean);
    } catch { files = null; }
  }
  if (!files) files = walk('.');
  return files.filter((f) => {
    if (!exists(f) || statSync(join(ROOT, f)).isDirectory()) return false;
    return !readFileSync(join(ROOT, f)).subarray(0, 8000).includes(0);
  }).sort();
}

// Headings of a file (any level, outside code fences), exact text.
const headingCache = new Map();
function headingsOf(rel) {
  if (!headingCache.has(rel)) {
    const set = new Set();
    let fence = false;
    for (const line of read(rel).split('\n')) {
      if (/^\s*(```|~~~)/.test(line)) { fence = !fence; continue; }
      if (fence) continue;
      const m = /^#{1,6}\s+(.*?)\s*#*\s*$/.exec(line);
      if (m) set.add(m[1]);
    }
    headingCache.set(rel, set);
  }
  return headingCache.get(rel);
}

// ---- 1. files
const skillDirs = readdirSync(join(ROOT, 'skills')).filter((n) => statSync(join(ROOT, 'skills', n)).isDirectory());
for (const d of skillDirs) {
  const rel = `skills/${d}/SKILL.md`;
  if (!exists(rel)) { bad('files', `skills/${d}`, 0, 'skill folder has no SKILL.md'); continue; }
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(read(rel));
  expect(fm, 'files', rel, 1, 'no frontmatter');
  if (!fm) continue;
  for (const key of ['name', 'description']) {
    expect(new RegExp(`^${key}:`, 'm').test(fm[1]), 'files', rel, 1, `frontmatter has no ${key}`);
  }
}
{
  const rel = 'skills/route/SKILL.md';
  const lines = read(rel).split('\n');
  let seen = 0;
  lines.forEach((line, i) => {
    const m = /^\|\s*`([\w.-]+\.md)`\s*\|/.exec(line);
    if (!m) return;
    seen++;
    expect(referenceNames.has(m[1]), 'files', rel, i + 1, `reference table names ${m[1]}, which is not in reference/`);
  });
  expect(seen > 0, 'files', rel, 0, 'no reference table found');
}

// ---- 2. paths
const OUTSIDE = new Set(['PLAN.md', 'PROGRESS.md', 'INDEX.md', 'sources.md', 'process-notes.md', 'config.md',
  'CHANGELOG.md', 'README.md', 'CLAUDE.md']);
const agentNames = new Set(ruleFiles.filter((f) => f.startsWith('agents/')).map((f) => f.slice('agents/'.length)));
for (const n of ['worker.md', 'reader.md']) {
  expect(agentNames.has(n), 'paths', `agents/${n}`, 0, 'missing: the agent shell is a file of this repository');
}
for (const f of ruleFiles) {
  read(f).split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/((?:[\w.-]+\/)*)([\w.-]+\.md)(?![\w])/g)) {
      const [, dir, name] = m;
      if (m.index > 0 && line[m.index - 1] === '>' ) continue; // placeholder before it
      const bad1 = (what) => bad('paths', f, i + 1, `${dir}${name} ${what}`);
      if (name === 'SKILL.md') {
        const sk = /(?:^|\/)([\w-]+)\/$/.exec(dir); // the folder just before SKILL.md
        if (sk && !['skills', 'reference'].includes(sk[1])) expect(exists(`skills/${sk[1]}/SKILL.md`), 'paths', f, i + 1, `${dir}${name} does not exist`);
        else ok();
      } else if (dir.endsWith('reference/')) {
        expect(referenceNames.has(name), 'paths', f, i + 1, `${dir}${name} does not exist`);
      } else if (dir.endsWith('agents/')) {
        expect(agentNames.has(name), 'paths', f, i + 1, `${dir}${name} does not exist`);
      } else if (referenceNames.has(name) || agentNames.has(name) || OUTSIDE.has(name)) ok();
      else bad1('is not a file in reference/ or a known outside name (misspelt?)');
    }
  });
}

// ---- 3. sections
const refs = []; // { from, line, target, phrase, form }
const F = '`?((?:[\\w.\\-]+/)*[\\w-]+\\.md)`?';
const Q = '"([^"\\n]+)"';
function resolveTarget(spec, from) {
  if (/(^|\/)DATA\//.test(spec) || spec.includes('memory/')) return null; // data file, not a rule file
  if (/SKILL\.md$/.test(spec)) {
    const m = /(?:^|\/)([\w-]+)\/SKILL\.md$/.exec(spec);
    return m ? `skills/${m[1]}/SKILL.md` : null;
  }
  const base = spec.split('/').pop();
  if (spec.startsWith('agents/')) return `agents/${base}`;
  return referenceNames.has(base) ? `reference/${base}` : null;
}
for (const f of ruleFiles) {
  read(f).split('\n').forEach((line, i) => {
    const add = (spec, phrase, form) => {
      const target = resolveTarget(spec, f);
      if (target) refs.push({ from: f, line: i + 1, target, phrase, form, spec });
    };
    for (const m of line.matchAll(new RegExp(`${F},\\s+${Q}`, 'g'))) add(m[1], m[2], 'F, "X"');
    for (const m of line.matchAll(new RegExp(`${F}\\s+${Q}`, 'g'))) add(m[1], m[2], 'F "X"');
    for (const m of line.matchAll(new RegExp(`${F}\\s+\\((?=\\s*")([^)]*)\\)`, 'g'))) {
      for (const q of m[2].matchAll(new RegExp(Q, 'g'))) add(m[1], q[1], 'F ("X" ...)');
    }
    for (const m of line.matchAll(new RegExp(`${Q}\\s+in\\s+${F}`, 'g'))) add(m[2], m[1], '"X" in F');
    const li = /^\s*[-*]\s+`((?:[\w.\-]+\/)*[\w-]+\.md)`:\s*(.*)$/.exec(line);
    if (li) for (const q of li[2].matchAll(new RegExp(Q, 'g'))) add(li[1], q[1], 'list item');
  });
}
{
  const seen = new Set();
  for (const r of refs) {
    const key = `${r.from}:${r.line}:${r.target}:${r.phrase}`;
    if (seen.has(key)) r.dup = true;
    seen.add(key);
  }
}
const uniqueRefs = refs.filter((r) => !r.dup);
for (const r of uniqueRefs) {
  expect(headingsOf(r.target).has(r.phrase), 'sections', r.from, r.line,
    `"${r.phrase}" is not a heading in ${r.target}`);
}

// A phrase "(X, below)" names a heading of the same file (letter case ignored)
for (const f of ruleFiles) {
  const heads = new Set([...headingsOf(f)].map((h) => h.toLowerCase()));
  read(f).split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/\(([^()]+?),\s*below\)/g)) {
      const x = m[1].trim();
      expect(heads.has(x.toLowerCase()), 'sections', f, i + 1, `"${x}" is not a heading in this file ("below")`);
    }
  });
}

// ---- 4. protected
{
  const rel = 'reference/improve.md';
  const lines = read(rel).split('\n');
  const start = lines.findIndex((l) => /^#{1,6}\s+Protected rules\s*$/.test(l));
  expect(start >= 0, 'protected', rel, 0, 'no heading "Protected rules"');
  if (start >= 0) {
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) if (/^#{1,6}\s/.test(lines[i])) { end = i; break; }
    const n = uniqueRefs.filter((r) => r.from === rel && r.form === 'list item' && r.line > start + 1 && r.line <= end).length;
    expect(n >= 9, 'protected', rel, start + 1, `only ${n} protected section names recognised in the list (9 needed)`);
  }
}

// ---- 5. isolation
{
  const files = [...walk('skills'), ...walk('reference'), ...walk('agents'), ...walk('.claude-plugin')];
  for (const f of files) {
    let hit = false;
    read(f).split('\n').forEach((line, i) => {
      const m = /pixel|wallpaper/i.exec(line);
      if (m) { hit = true; bad('isolation', f, i + 1, `names another plugin ("${m[0]}")`); }
    });
    if (!hit) ok();
  }
}

// ---- 6, 8. private, line endings
const tracked = trackedTextFiles();
{
  const PLACEHOLDER_USERS = new Set(['you', 'user', 'username', 'name', 'yourname', 'your-name', 'example', 'me']);
  for (const f of tracked) {
    const lines = read(f).split('\n');
    let hit = false;
    lines.forEach((line, i) => {
      for (const m of line.matchAll(/(?:[A-Za-z]:)?[\\/]Users[\\/]([A-Za-z0-9._-]+)/g)) {
        if (PLACEHOLDER_USERS.has(m[1].toLowerCase())) continue;
        hit = true; bad('private', f, i + 1, 'holds a path under a user folder');
      }
      for (const m of line.matchAll(/[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,})/g)) {
        if (/(^|\.)users\.noreply\.github\.com$/i.test(m[1])) continue;
        hit = true; bad('private', f, i + 1, 'holds an email address');
      }
    });
    if (!hit) ok();
  }
  for (const f of tracked) {
    const text = read(f);
    const at = text.indexOf('\r');
    if (at < 0) { ok(); continue; }
    bad('line endings', f, text.slice(0, at).split('\n').length, 'holds a CR (the files are LF)');
  }
}

// ---- 7. version
{
  const pj = '.claude-plugin/plugin.json';
  const cl = 'CHANGELOG.md';
  let version = null;
  try { version = JSON.parse(read(pj)).version; } catch { bad('version', pj, 0, 'cannot read a version'); }
  const lines = read(cl).split('\n');
  const idx = lines.findIndex((l) => /^## \d+\.\d+\.\d+/.test(l));
  const top = idx >= 0 ? /^## (\d+\.\d+\.\d+)/.exec(lines[idx])[1] : null;
  if (idx < 0) bad('version', cl, 0, 'no "## x.y.z" heading');
  if (version && top) expect(version === top, 'version', cl, idx + 1, `top entry is ${top} but plugin.json says ${version}`);
  const mp = '.claude-plugin/marketplace.json';
  if (exists(mp) && version) {
    try {
      const j = JSON.parse(read(mp));
      const vs = [j.version, ...(Array.isArray(j.plugins) ? j.plugins.map((p) => p.version) : [])].filter((v) => v !== undefined);
      for (const v of vs) expect(v === version, 'version', mp, 0, `says ${v} but plugin.json says ${version}`);
    } catch { bad('version', mp, 0, 'cannot be read as JSON'); }
  }
}

// ---- 9. size
{
  const files = ['skills/route/SKILL.md', ...['memory', 'planning', 'routing', 'briefing', 'methods', 'checks', 'panel'].map((n) => `reference/${n}.md`)];
  let total = 0;
  for (const f of files) {
    if (!exists(f)) { bad('size', f, 0, 'missing'); continue; }
    total += (read(f).match(/\n/g) || []).length;
  }
  expect(total <= 600, 'size', 'skills/route/SKILL.md', 0, `the eight always-read files hold ${total} lines together (600 at most)`);
}

// ---- 10. kept text
{
  const check = 'kept text';
  const hasLine = (rel, prefix) => read(rel).split('\n').some((l) => l.startsWith(prefix));
  const hasHeading = (rel, text) => read(rel).split('\n').includes(text);
  const has = (rel, text) => read(rel).includes(text);
  const keep = (rel, ok1, what) => expect(ok1, check, rel, 0, `missing: ${what}`);

  const B = 'reference/briefing.md';
  keep(B, has(B, '- A "Done when" for something that must hold in several places names the hardest one and why (the narrowest layout, the darkest theme, the longest text, a hidden or late-mounted parent), and a check of "everywhere" lists each place it is run.'), 'the "Done when" sentence');
  keep(B, has(B, '- When two tasks need the same new piece, or one rule is enforced partly in each, both briefs name the one task that owns it; the other task waits for it, or is told to check that part last.'), 'the "same new piece" sentence');
  keep(B, hasLine(B, 'Hand back when:'), 'the template line "Hand back when:"');
  keep(B, hasLine(B, 'Budget:'), 'the template line "Budget:"');

  const M = 'reference/methods.md';
  keep(M, has(M, '1. **Test task.** One worker writes tests from the done criteria, runs them and shows they fail for the right reason. When the thing under test moves, changes over time or follows inputs that change (a list, a page, an animation, a window), the brief asks for tests of the changes as well as of the settled state: each input changing while it runs, the first moment, and an empty or cleared state.'), 'step 1 of the tests-first method');
  keep(M, has(M, '2. **Lock.** First read the new tests\' edge cases against the done criteria or the contract, working each literal expected value with the stated rules; a wrong case goes back to the test worker. When the tests call a typed interface, the test worker also type-checks its test file against the stated signatures, because a test runner may not type-check. Then you record the list of test files and their hashes. When that takes more than one command, have a cheap worker do it.'), 'step 2 of the tests-first method');

  const P = 'reference/planning.md';
  keep(P, has(P, "git add -- <the task's files>"), 'the commit rule "git add -- <the task\'s files>"');

  const heads = [
    ['skills/route/SKILL.md', '## Your context'],
    ['reference/planning.md', '## Waves'],
    ['reference/checks.md', '## Running the checks'],
    ['reference/memory.md', '## Long jobs'],
    ['reference/briefing.md', '## A return: the same worker or a fresh one'],
  ];
  for (const [rel, h] of heads) keep(rel, hasHeading(rel, h), `the heading "${h}"`);
}

// ---- output
if (LIST) {
  const lines = uniqueRefs.map((r) => `${r.from}:${r.line} -> ${r.target} "${r.phrase}"`);
  console.log(`references recognised: ${lines.length}`);
  for (const l of lines) console.log(l);
}
for (const f of failures) console.log(f);
console.log(`check: ${passed} passed, ${failures.length} failed`);
process.exit(failures.length ? 1 : 0);
