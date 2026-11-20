// Lettura dell'etichetta con Claude (facoltativa, con la chiave API dell'utente salvata solo sul dispositivo).
import { blobToDataURL } from './media.js';

export const DEFAULT_MODEL = 'claude-sonnet-5-5';

const PROMPT = `Sei un sommelier. Leggi l'etichetta del vino nella foto e restituisci SOLO un oggetto JSON con queste chiavi (stringhe, vuote se non leggibili o non deducibili con buona sicurezza):
{"name": nome del vino come in etichetta,
 "winery": nome della cantina,
 "producer": produttore/imbottigliatore se diverso dalla cantina (altrimenti uguale alla cantina),
 "vintage": annata a 4 cifre,
 "origin": denominazione (es. "Barolo DOCG") seguita da regione e paese,
 "grape": vitigno/i (se non scritti ma tipici della denominazione, indica quelli del disciplinare),
 "type": uno tra "Rosso","Bianco","Rosato","Bollicine","Dolce / passito","Fortificato","Altro",
 "abv": gradazione alcolica in % vol, solo il numero}
Scrivi in italiano. Nessun testo fuori dal JSON.`;

export function getAISettings() {
  return {
    key: localStorage.getItem('dv.apikey') || '',
    model: localStorage.getItem('dv.model') || DEFAULT_MODEL,
  };
}

export function saveAISettings({ key, model }) {
  if (key) localStorage.setItem('dv.apikey', key.trim()); else localStorage.removeItem('dv.apikey');
  localStorage.setItem('dv.model', (model || DEFAULT_MODEL).trim());
}

export async function readLabel(blob) {
  const { key, model } = getAISettings();
  if (!key) throw new Error('Inserisci la chiave API nella sezione Altro');
  const dataUrl = await blobToDataURL(blob);
  const [meta, b64] = dataUrl.split(',');
  const mediaType = (meta.match(/data:(.*?);/) || [])[1] || 'image/jpeg';

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: b64 } },
          { type: 'text', text: PROMPT },
        ],
      }],
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = j && j.error && j.error.message ? j.error.message : `errore ${r.status}`;
    throw new Error(r.status === 401 ? 'Chiave API non valida' : msg);
  }
  const text = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('Risposta non leggibile');
  const out = JSON.parse(m[0]);
  Object.keys(out).forEach(k => { out[k] = (out[k] ?? '').toString().trim(); if (!out[k]) delete out[k]; });
  if (out.abv) out.abv = out.abv.replace('.', ',').replace(/[^\d,]/g, '');
  return out;
}
