import { readFile, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const context = { window: {} };
vm.runInNewContext(await readFile(path.join(root, 'js/supabase-config.js'), 'utf8'), context, { timeout: 1000 });
const fallback = context.window.SUPABASE_CONFIG || {};
const url = (process.env.SUPABASE_URL || fallback.url || '').trim();
const key = (process.env.SUPABASE_PUBLISHABLE_KEY || fallback.key || '').trim();
if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in Vercel Environment Variables before deploying.');
if (new URL(url).protocol !== 'https:') throw new Error('SUPABASE_URL must use HTTPS.');
if (key.startsWith('sb_secret_')) throw new Error('Use the publishable key, never a secret key.');
if (key.split('.').length === 3) {
  const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString());
  if (claims.role !== 'anon') throw new Error('Only a legacy anon JWT key is allowed in the browser.');
}
// Explicit asset list keeps backups, SQL, and development files out of hosting.
for (const relative of ['index.html', 'css/certificates.css', 'js/certificates.js', 'images/sha.png']) {
  const destination = path.join(root, 'dist', relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(path.join(root, relative), destination);
}
await mkdir(path.join(root, 'dist/js'), { recursive: true });
await writeFile(path.join(root, 'dist/js/supabase-config.js'), `window.SUPABASE_CONFIG = ${JSON.stringify({ url, key })};\n`);
console.log('Certificate portal built in dist/.');
