// Captures launcher screenshots from the launcher's standalone (mock) UI into site/assets/img/screens.
// Usage: node tools/screens.mjs [path-to-cb-launcher/src/launcher-ui]
import { copyFileSync, rmSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ui = resolve(process.argv[2] || join(root, '..', 'cb-launcher', 'src', 'launcher-ui'));
const chrome = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const out = join(root, 'site', 'assets', 'img', 'screens');
const views = { library: [1280, 800], game: [1280, 800], friends: [1280, 600] };

if (!existsSync(join(ui, 'main.html'))) throw new Error(`launcher UI not found at ${ui}`);
mkdirSync(out, { recursive: true });
const harness = join(ui, 'shot.html');
copyFileSync(join(root, 'tools', 'launcher-shot.html'), harness);
try {
  for (const [view, [w, h]] of Object.entries(views)) {
    const png = join(out, `${view}.png`);
    execFileSync(chrome, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
      `--window-size=${w},${h}`, '--virtual-time-budget=15000', `--screenshot=${png}`,
      `${pathToFileURL(harness).href}?view=${view}`,
    ], { stdio: 'ignore' });
    execFileSync('python', ['-c', `from PIL import Image; Image.open(r'${png}').convert('RGB').save(r'${png.replace(/\.png$/, '.webp')}', 'WEBP', quality=86, method=6)`]);
    unlinkSync(png);
    console.log(`captured ${view}`);
  }
} finally {
  rmSync(harness, { force: true });
}
