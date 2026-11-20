import { db, newId, requestPersistence } from './db.js';
import { compressImage, readExif, getPosition, reverseGeocode, blobToDataURL, dataURLToBlob } from './media.js';
import { scanLive, scanImage, validEan } from './scanner.js';
import { lookupBarcode } from './lookup.js';
import { readLabel, getAISettings, saveAISettings, DEFAULT_MODEL } from './ai.js';

const $ = (s, el = document) => el.querySelector(s);
const FIELDS = ['barcode', 'name', 'winery', 'producer', 'vintage', 'type', 'grape', 'origin', 'abv', 'price', 'date', 'place', 'notes'];
const LABELS = { name: 'nome', winery: 'cantina', producer: 'produttore', vintage: 'annata', type: 'tipologia', grape: 'vitigno', origin: 'provenienza', abv: 'gradazione' };

const els = {
  title: $('#page-title'), main: $('#main'),
  views: { list: $('#view-list'), edit: $('#view-edit'), detail: $('#view-detail'), map: $('#view-map'), settings: $('#view-settings') },
  form: $('#wine-form'), list: $('#wine-list'), empty: $('#empty-state'), count: $('#list-count'), search: $('#search-input'),
  photoPreview: $('#photo-preview'), photoImg: $('#photo-img'), aiBtn: $('#ai-read'),
  lookupStatus: $('#lookup-status'), gpsStatus: $('#gps-status'), rating: $('#rating'),
};

// Stato della scheda in modifica
let draft = null;
let objectURLs = [];
let map, mapLayer;

/* ---------------- Utilità ---------------- */
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2800);
}
function setStatus(el, msg, kind = '') { el.textContent = msg; el.className = 'status' + (kind ? ' ' + kind : ''); }
function trackURL(blob) { const u = URL.createObjectURL(blob); objectURLs.push(u); return u; }
function releaseURLs() { objectURLs.forEach(u => URL.revokeObjectURL(u)); objectURLs = []; }
const pad = n => String(n).padStart(2, '0');
function toLocalInput(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function formatDate(s) {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}
function esc(s) { return (s ?? '').toString().replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function stars(n) { n = Number(n) || 0; return n ? '★'.repeat(n) + '☆'.repeat(5 - n) : ''; }
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* ---------------- Router ---------------- */
async function route() {
  const hash = location.hash || '#/';
  const [, page, id] = hash.split('/');
  releaseURLs();
  let view = 'list', title = 'I miei vini', tab = 'list';

  if (page === 'nuovo') { view = 'edit'; title = 'Nuovo vino'; tab = 'edit'; await openForm(null); }
  else if (page === 'modifica' && id) { view = 'edit'; title = 'Modifica vino'; tab = 'list'; await openForm(id); }
  else if (page === 'vino' && id) { view = 'detail'; title = 'Scheda vino'; tab = 'list'; if (!(await renderDetail(id))) return (location.hash = '#/'); }
  else if (page === 'mappa') { view = 'map'; title = 'Dove ho bevuto'; tab = 'map'; }
  else if (page === 'impostazioni') { view = 'settings'; title = 'Altro'; tab = 'settings'; renderSettings(); }
  else { await renderList(); }

  Object.entries(els.views).forEach(([k, el]) => { el.hidden = k !== view; });
  els.title.textContent = title;
  document.title = `${title} · Diario Vini`;
  document.querySelectorAll('.tabbar a').forEach(a => {
    if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
  if (route.started) els.main.focus({ preventScroll: true });
  route.started = true;
  if (view === 'map') renderMap();
}

/* ---------------- Lista ---------------- */
async function renderList() {
  const all = await db.all();
  const q = els.search.value.trim().toLowerCase();
  const items = q ? all.filter(w => FIELDS.some(f => (w[f] || '').toString().toLowerCase().includes(q))) : all;
  els.list.innerHTML = '';
  els.empty.hidden = all.length > 0;
  els.count.textContent = all.length ? (q ? `${items.length} su ${all.length} vini` : `${all.length} ${all.length === 1 ? 'vino' : 'vini'}`) : '';
  for (const w of items) {
    const li = document.createElement('li');
    li.className = 'wine-item';
    const thumb = w.thumb ? `<img class="wine-thumb" src="${trackURL(w.thumb)}" alt="">`
      : `<span class="wine-thumb placeholder" aria-hidden="true"><svg viewBox="0 0 64 64"><use href="#glass"/></svg></span>`;
    const sub = [w.winery, w.vintage].filter(Boolean).join(' · ');
    const meta = [w.date ? new Date(w.date).toLocaleDateString('it-IT') : '', w.place].filter(Boolean).join(' · ');
    li.innerHTML = `<a href="#/vino/${w.id}">${thumb}<span class="wine-info">
      <span class="wine-name">${esc(w.name || 'Vino senza nome')}</span>
      ${sub ? `<span class="wine-sub">${esc(sub)}</span>` : ''}
      ${w.rating ? `<span class="stars" aria-label="Voto ${w.rating} su 5">${stars(w.rating)}</span>` : ''}
      ${meta ? `<span class="wine-meta">${esc(meta)}</span>` : ''}
    </span></a>`;
    els.list.appendChild(li);
  }
}
let searchT;
els.search.addEventListener('input', () => { clearTimeout(searchT); searchT = setTimeout(renderList, 150); });

/* ---------------- Dettaglio ---------------- */
async function renderDetail(id) {
  const w = await db.get(id);
  if (!w) return false;
  const rows = [
    ['Cantina', w.winery], ['Produttore', w.producer !== w.winery ? w.producer : ''], ['Annata', w.vintage], ['Tipologia', w.type],
    ['Vitigno', w.grape], ['Provenienza', w.origin], ['Gradazione', w.abv ? `${w.abv}% vol` : ''], ['Prezzo', w.price ? `€ ${w.price}` : ''],
    ['Bevuto il', formatDate(w.date)],
    ['Luogo', w.place ? (w.lat != null
      ? `<a href="https://www.openstreetmap.org/?mlat=${w.lat}&mlon=${w.lon}#map=17/${w.lat}/${w.lon}" rel="noopener">${esc(w.place)}</a>`
      : esc(w.place)) : ''],
    ['Voto', w.rating ? `<span class="stars" aria-hidden="true">${stars(w.rating)}</span><span class="visually-hidden">${w.rating} su 5</span>` : ''],
    ['Note', w.notes], ['Codice', w.barcode],
  ].filter(([, v]) => v);
  const html = (k, v) => (k === 'Luogo' || k === 'Voto') ? v : esc(v);
  $('#detail-body').innerHTML = `
    ${w.photo ? `<img class="detail-photo" src="${trackURL(w.photo)}" alt="Etichetta di ${esc(w.name || 'vino')}">` : ''}
    <h2 class="detail-title">${esc(w.name || 'Vino senza nome')}</h2>
    <p class="detail-sub">${esc([w.winery, w.vintage].filter(Boolean).join(' · '))}</p>
    <dl class="dl card">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${html(k, v)}</dd>`).join('')}</dl>`;
  $('#detail-edit').onclick = () => { location.hash = `#/modifica/${id}`; };
  $('#detail-delete').onclick = async () => {
    if (await confirmDialog()) { await db.delete(id); toast('Vino eliminato'); location.hash = '#/'; }
  };
  return true;
}

function confirmDialog() {
  const d = $('#confirm');
  return new Promise(res => {
    const done = v => { d.close(); res(v); };
    $('#confirm-yes').onclick = () => done(true);
    $('#confirm-no').onclick = () => done(false);
    d.oncancel = () => res(false);
    d.showModal();
    $('#confirm-no').focus();
  });
}

/* ---------------- Form ---------------- */
function renderRating(value) {
  els.rating.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(i === value));
    b.setAttribute('aria-label', `${i} ${i === 1 ? 'stella' : 'stelle'}`);
    b.tabIndex = (value ? i === value : i === 1) ? 0 : -1;
    b.textContent = '★';
    if (i <= value) b.classList.add('on');
    b.addEventListener('click', () => { draft.rating = draft.rating === i ? 0 : i; renderRating(draft.rating); els.rating.children[i - 1].focus(); });
    b.addEventListener('keydown', e => {
      const map = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
      if (map[e.key]) {
        e.preventDefault();
        const n = Math.min(5, Math.max(1, (draft.rating || 0) + map[e.key]));
        draft.rating = n; renderRating(n); els.rating.children[n - 1].focus();
      }
    });
    els.rating.appendChild(b);
  }
}

function setField(name, value) { const el = els.form.elements[name]; if (el) el.value = value ?? ''; }

function showPhoto() {
  if (draft.photo) {
    els.photoImg.src = trackURL(draft.photo);
    els.photoPreview.hidden = false;
    els.aiBtn.hidden = false;
  } else {
    els.photoPreview.hidden = true;
    els.photoImg.removeAttribute('src');
    els.aiBtn.hidden = true;
  }
}

async function openForm(id) {
  els.form.reset();
  setStatus(els.lookupStatus, ''); setStatus(els.gpsStatus, '');
  if (id) {
    const w = await db.get(id);
    if (!w) { location.hash = '#/'; return; }
    draft = { ...w };
    FIELDS.forEach(f => setField(f, w[f]));
  } else {
    draft = { id: null, photo: null, thumb: null, lat: null, lon: null, rating: 0, locationFrom: null };
    setField('date', toLocalInput(new Date()));
    locate(false);
  }
  renderRating(draft.rating || 0);
  showPhoto();
}

async function locate(userInitiated) {
  setStatus(els.gpsStatus, 'Rilevo la posizione…');
  try {
    const pos = await getPosition();
    if (draft.locationFrom === 'photo' && !userInitiated) return setStatus(els.gpsStatus, '');
    draft.lat = pos.lat; draft.lon = pos.lon; draft.locationFrom = 'gps';
    setStatus(els.gpsStatus, 'Posizione rilevata, cerco l\'indirizzo…');
    await fillPlace(pos.lat, pos.lon, 'Posizione dal GPS del telefono');
  } catch (e) {
    setStatus(els.gpsStatus, e.message + '. Puoi scrivere il luogo a mano.', 'err');
  }
}

async function fillPlace(lat, lon, okMsg) {
  try {
    const place = await reverseGeocode(lat, lon);
    if (place) setField('place', place);
    setStatus(els.gpsStatus, okMsg, 'ok');
  } catch {
    if (!els.form.elements.place.value) setField('place', `${lat.toFixed(5)}, ${lon.toFixed(5)}`);
    setStatus(els.gpsStatus, okMsg + ' (indirizzo non disponibile offline)', 'ok');
  }
}

async function handlePhoto(file, fromGallery) {
  if (!file) return;
  toast('Elaboro la foto…');
  try {
    draft.photo = await compressImage(file, 1600, 0.82);
    draft.thumb = await compressImage(draft.photo, 360, 0.75);
    showPhoto();
    if (fromGallery) {
      const ex = await readExif(file);
      const notes = [];
      if (ex.date) { setField('date', toLocalInput(ex.date)); notes.push('data'); }
      if (ex.lat != null && ex.lon != null) {
        draft.lat = ex.lat; draft.lon = ex.lon; draft.locationFrom = 'photo';
        notes.push('luogo');
        await fillPlace(ex.lat, ex.lon, 'Luogo preso dalla foto');
      }
      if (notes.length) toast(`${notes.join(' e ')} presi dalla foto`.replace(/^./, c => c.toUpperCase()));
    }
  } catch {
    toast('Impossibile leggere la foto');
  }
}

$('#photo-camera').addEventListener('change', e => { handlePhoto(e.target.files[0], false); e.target.value = ''; });
$('#photo-gallery').addEventListener('change', e => { handlePhoto(e.target.files[0], true); e.target.value = ''; });
$('#photo-remove').addEventListener('click', () => { draft.photo = null; draft.thumb = null; showPhoto(); $('#photo-camera').focus(); });
$('#gps-btn').addEventListener('click', () => locate(true));

/** Compila solo i campi vuoti; restituisce l'elenco di quelli compilati. */
function fillEmpty(data) {
  const filled = [];
  for (const [k, v] of Object.entries(data)) {
    const el = els.form.elements[k];
    if (!el || !v || el.value.trim()) continue;
    if (el.tagName === 'SELECT' && ![...el.options].some(o => o.value === v || o.text === v)) continue;
    el.value = v;
    if (LABELS[k]) filled.push(LABELS[k]);
  }
  return filled;
}

async function doLookup(code) {
  code = (code || '').replace(/\D/g, '');
  if (!code) return setStatus(els.lookupStatus, 'Inserisci o scansiona un codice.', 'err');
  setField('barcode', code);
  if (!validEan(code)) setStatus(els.lookupStatus, 'Attenzione: il codice non sembra valido, provo comunque…');
  else setStatus(els.lookupStatus, 'Cerco il vino…');
  const btn = $('#lookup-btn'); btn.disabled = true;
  try {
    const res = await lookupBarcode(code);
    const filled = fillEmpty(res.data);
    if (res.found) {
      setStatus(els.lookupStatus, filled.length
        ? `Trovato su ${res.source}: compilati ${filled.join(', ')}. Controlla e completa.`
        : `Trovato su ${res.source}, ma senza dati nuovi da aggiungere.`, 'ok');
    } else {
      const hint = getAISettings().key ? ' Prova "Leggi l\'etichetta con l\'AI".' : '';
      setStatus(els.lookupStatus, `Vino non presente nei database aperti${res.country ? ` (codice registrato in ${res.country})` : ''}. Compila a mano.${hint}`, 'err');
    }
  } catch {
    setStatus(els.lookupStatus, 'Ricerca non riuscita: sei online?', 'err');
  } finally { btn.disabled = false; }
}

$('#lookup-btn').addEventListener('click', () => doLookup(els.form.elements.barcode.value));
els.form.elements.barcode.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doLookup(e.target.value); } });

$('#scan-btn').addEventListener('click', async () => {
  const code = await scanLive({ dialog: $('#scanner'), video: $('#scanner-video'), closeBtn: $('#scanner-close'), torchBtn: $('#scanner-torch'), hint: $('#scanner-hint') });
  $('#scan-btn').focus();
  if (code) doLookup(code);
});
$('#scan-photo-btn').addEventListener('click', () => $('#scan-photo-input').click());
$('#scan-photo-input').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  setStatus(els.lookupStatus, 'Cerco il codice nella foto…');
  const code = await scanImage(f).catch(() => null);
  if (code) doLookup(code);
  else setStatus(els.lookupStatus, 'Nessun codice a barre trovato nella foto. Prova a inquadrarlo più da vicino.', 'err');
});

els.aiBtn.addEventListener('click', async () => {
  if (!draft.photo) return;
  if (!getAISettings().key) { toast('Prima inserisci la chiave API in Altro'); return; }
  els.aiBtn.disabled = true;
  setStatus(els.lookupStatus, 'Claude sta leggendo l\'etichetta…');
  try {
    const data = await readLabel(draft.photo);
    const filled = fillEmpty(data);
    setStatus(els.lookupStatus, filled.length ? `Dall'etichetta: compilati ${filled.join(', ')}. Controlla i dati.` : 'Nessun dato nuovo letto dall\'etichetta.', 'ok');
  } catch (e) {
    setStatus(els.lookupStatus, 'Lettura non riuscita: ' + e.message, 'err');
  } finally { els.aiBtn.disabled = false; }
});

els.form.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(els.form);
  const w = { ...draft };
  FIELDS.forEach(f => { w[f] = (fd.get(f) || '').toString().trim(); });
  if (!w.name && !w.photo && !w.winery) {
    toast('Aggiungi almeno una foto o il nome del vino');
    $('#f-name').focus();
    return;
  }
  const now = new Date().toISOString();
  if (!w.id) { w.id = newId(); w.createdAt = now; }
  w.updatedAt = now;
  if (!w.date) w.date = toLocalInput(new Date());
  delete w.locationFrom;
  await db.put(w);
  requestPersistence();
  toast('Vino salvato');
  location.hash = `#/vino/${w.id}`;
});
$('#cancel-btn').addEventListener('click', () => history.length > 1 ? history.back() : (location.hash = '#/'));

/* ---------------- Mappa ---------------- */
async function renderMap() {
  const all = (await db.all()).filter(w => w.lat != null && w.lon != null);
  $('#map-empty').hidden = all.length > 0;
  if (!window.L) return;
  if (!map) {
    map = L.map('map', { zoomControl: true }).setView([45.07, 7.68], 8);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    mapLayer = L.layerGroup().addTo(map);
  }
  mapLayer.clearLayers();
  const pts = [];
  for (const w of all) {
    const img = w.thumb ? `<img src="${trackURL(w.thumb)}" alt="">` : '';
    L.marker([w.lat, w.lon], { title: w.name || 'Vino' })
      .bindPopup(`${img}<strong>${esc(w.name || 'Vino senza nome')}</strong><br>${esc([w.vintage, w.place].filter(Boolean).join(' · '))}<br><a href="#/vino/${w.id}">Apri scheda</a>`)
      .addTo(mapLayer);
    pts.push([w.lat, w.lon]);
  }
  setTimeout(() => {
    map.invalidateSize();
    if (pts.length === 1) map.setView(pts[0], 14);
    else if (pts.length) map.fitBounds(pts, { padding: [30, 30] });
  }, 50);
}

/* ---------------- Impostazioni & backup ---------------- */
function renderSettings() {
  const s = getAISettings();
  $('#s-apikey').value = s.key;
  $('#s-model').value = s.model;
  setStatus($('#settings-status'), ''); setStatus($('#backup-status'), '');
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(e => {
      $('#storage-info').textContent = `Spazio usato: ${(e.usage / 1048576).toFixed(1)} MB.`;
    });
  }
}

$('#save-settings').addEventListener('click', () => {
  saveAISettings({ key: $('#s-apikey').value, model: $('#s-model').value || DEFAULT_MODEL });
  setStatus($('#settings-status'), 'Impostazioni salvate su questo telefono.', 'ok');
});

const stamp = () => new Date().toISOString().slice(0, 10).replace(/-/g, '');

$('#export-json').addEventListener('click', async () => {
  setStatus($('#backup-status'), 'Preparo il backup…');
  const all = await db.all();
  const out = [];
  for (const w of all) {
    const o = { ...w };
    o.photo = w.photo ? await blobToDataURL(w.photo) : null;
    o.thumb = w.thumb ? await blobToDataURL(w.thumb) : null;
    out.push(o);
  }
  download(new Blob([JSON.stringify({ app: 'diariovini', version: 1, exportedAt: new Date().toISOString(), wines: out })], { type: 'application/json' }), `diariovini_backup_${stamp()}.json`);
  setStatus($('#backup-status'), `Backup di ${all.length} vini scaricato.`, 'ok');
});

$('#export-csv').addEventListener('click', async () => {
  const all = await db.all();
  const cols = ['date', 'name', 'winery', 'producer', 'vintage', 'type', 'grape', 'origin', 'abv', 'price', 'rating', 'place', 'lat', 'lon', 'barcode', 'notes'];
  const head = ['Data', 'Nome', 'Cantina', 'Produttore', 'Annata', 'Tipologia', 'Vitigno', 'Provenienza', 'Gradazione', 'Prezzo', 'Voto', 'Luogo', 'Latitudine', 'Longitudine', 'Codice', 'Note'];
  const q = v => `"${(v ?? '').toString().replace(/"/g, '""')}"`;
  const csv = '﻿' + [head.map(q).join(';'), ...all.map(w => cols.map(c => q(w[c])).join(';'))].join('\r\n');
  download(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `diariovini_${stamp()}.csv`);
  setStatus($('#backup-status'), 'Tabella CSV scaricata.', 'ok');
});

$('#import-json').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  try {
    const j = JSON.parse(await f.text());
    const list = Array.isArray(j) ? j : j.wines;
    if (!Array.isArray(list)) throw new Error();
    const wines = [];
    for (const w of list) {
      if (!w || !w.id) continue;
      const o = { ...w };
      o.photo = w.photo ? await dataURLToBlob(w.photo) : null;
      o.thumb = w.thumb ? await dataURLToBlob(w.thumb) : null;
      wines.push(o);
    }
    await db.putMany(wines);
    setStatus($('#backup-status'), `Importati ${wines.length} vini.`, 'ok');
  } catch {
    setStatus($('#backup-status'), 'File di backup non valido.', 'err');
  }
});

/* ---------------- Avvio ---------------- */
window.addEventListener('hashchange', route);
route();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
