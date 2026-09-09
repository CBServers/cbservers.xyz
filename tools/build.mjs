// Builds public/ from site/, redirects.json and content/*.md. No dependencies.
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public');
const SITE = 'https://cbservers.xyz';

rmSync(out, { recursive: true, force: true });
cpSync(join(root, 'site'), out, { recursive: true });

const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Redirects: GitHub Pages has no server-side redirects, so each one is a tiny page.
const redirects = JSON.parse(readFileSync(join(root, 'redirects.json'), 'utf8'));
for (const [from, to] of Object.entries(redirects)) {
  const dir = join(out, from);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Redirecting</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${escape(to)}">
<meta http-equiv="refresh" content="0; url=${escape(to)}">
<script>location.replace(${JSON.stringify(to)});</script>
</head>
<body><p>Redirecting to <a href="${escape(to)}">${escape(to)}</a>.</p></body>
</html>
`);
}

// Minimal Markdown for the legal pages: headings, paragraphs, lists, bold, italic, code, links.
function inline(s) {
  return escape(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])_([^_]+)_(?!\w)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function markdown(src) {
  const lines = src.split(/\r?\n/);
  const html = [];
  let para = [], list = [];
  const flush = () => {
    if (para.length) { html.push(`<p>${inline(para.join(' '))}</p>`); para = []; }
    if (list.length) { html.push(`<ul>${list.map(i => `<li>${inline(i)}</li>`).join('')}</ul>`); list = []; }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) { flush(); html.push(`<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`); continue; }
    if (/^[-*]\s+/.test(line)) { if (para.length) flush(); list.push(line.replace(/^[-*]\s+/, '')); continue; }
    if (/^\s+\S/.test(raw) && list.length) { list[list.length - 1] += ' ' + line.trim(); continue; }
    if (!line.trim()) { flush(); continue; }
    if (list.length) flush();
    para.push(line.trim());
  }
  flush();
  return html.join('\n');
}

function frontmatter(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(src);
  if (!m) return [{}, src];
  const meta = {};
  for (const l of m[1].split(/\r?\n/)) {
    const kv = /^(\w+):\s*(.*)$/.exec(l);
    if (kv) meta[kv[1]] = kv[2].replace(/^"|"$/g, '');
  }
  return [meta, m[2]];
}

const layout = readFileSync(join(root, 'tools', 'page.html'), 'utf8');
for (const file of readdirSync(join(root, 'content')).filter(f => f.endsWith('.md'))) {
  const slug = file.replace(/\.md$/, '');
  const [meta, body] = frontmatter(readFileSync(join(root, 'content', file), 'utf8'));
  const title = meta.title || slug;
  const page = layout
    .replaceAll('{{title}}', escape(title))
    .replaceAll('{{description}}', escape(meta.description || `${title} for the CB Servers Launcher and services.`))
    .replaceAll('{{url}}', `${SITE}/${slug}/`)
    .replace('{{body}}', `<h1>${escape(title)}</h1>\n${markdown(body)}`);
  mkdirSync(join(out, slug), { recursive: true });
  writeFileSync(join(out, slug, 'index.html'), page);
}

console.log(`built ${out}: ${Object.keys(redirects).length} redirects`);
