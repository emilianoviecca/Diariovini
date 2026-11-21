// Controllo aggiornamenti dell'app Android: confronta la versione installata con l'ultima release su GitHub.
import { VERSION } from './version.js';

const API = 'https://api.github.com/repos/emilianoviecca/diariovini/releases/latest';

const parse = v => (v || '').replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
export function isNewer(remote, local) {
  const a = parse(remote), b = parse(local);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
  }
  return false;
}

export const isApp = () => VERSION !== 'web';

/** Restituisce { version, url } se c'è una versione più nuova, altrimenti null. */
export async function checkForUpdate() {
  if (!isApp()) return null;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(API, { signal: ctrl.signal, headers: { Accept: 'application/vnd.github+json' } });
    if (!r.ok) throw new Error('GitHub non raggiungibile');
    const rel = await r.json();
    const version = (rel.tag_name || '').replace(/^v/, '');
    if (!isNewer(version, VERSION)) return null;
    const asset = (rel.assets || []).find(a => /^sorsi-[\d.]+\.apk$/.test(a.name)) || (rel.assets || []).find(a => a.name.endsWith('.apk'));
    return { version, url: asset ? asset.browser_download_url : rel.html_url };
  } finally {
    clearTimeout(t);
  }
}
