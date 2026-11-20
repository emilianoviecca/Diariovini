// Ricerca informazioni a partire dal codice a barre.
import { findDenominazione, findGrapes, findVintage, guessType, countryFromBarcode } from './wine-knowledge.js';

const OFF_FIELDS = [
  'code', 'product_name', 'product_name_it', 'generic_name', 'generic_name_it', 'brands', 'brand_owner',
  'categories', 'categories_tags', 'labels', 'labels_tags', 'origins', 'origin_it', 'origin', 'manufacturing_places',
  'countries_tags', 'ingredients_text', 'ingredients_text_it', 'nutriments', 'quantity', 'image_front_url',
].join(',');

const clean = s => (s || '').toString().replace(/\s+/g, ' ').trim();
const firstOf = s => clean((s || '').split(',')[0]);
const tagName = t => t.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ');

async function fetchJSON(url, ms = 9000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; } finally { clearTimeout(timer); }
}

async function openFoodFacts(code) {
  const j = await fetchJSON(`https://world.openfoodfacts.org/api/v2/product/${code}?fields=${OFF_FIELDS}`);
  if (!j || j.status !== 1 || !j.product) return null;
  return j.product;
}

async function upcItemDb(code) {
  const j = await fetchJSON(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`, 7000);
  const it = j && j.items && j.items[0];
  if (!it) return null;
  return { title: clean(it.title), brand: clean(it.brand), description: clean(it.description) };
}

/**
 * Cerca il vino. Restituisce { found, source, data: {name, winery, producer, vintage, origin, grape, type, abv} }
 */
export async function lookupBarcode(code) {
  const data = {};
  let source = '';
  let corpus = '';

  const p = await openFoodFacts(code);
  if (p) {
    source = 'Open Food Facts';
    data.name = clean(p.product_name_it || p.product_name || p.generic_name_it || p.generic_name);
    const brand = firstOf(p.brands);
    data.winery = brand;
    data.producer = clean(p.brand_owner) || firstOf(p.manufacturing_places) || brand;
    const alc = p.nutriments && (p.nutriments.alcohol_100g ?? p.nutriments.alcohol ?? p.nutriments.alcohol_value);
    if (alc) data.abv = String(alc).replace('.', ',');
    const cats = p.categories_tags || [];
    corpus = [data.name, p.generic_name_it, p.generic_name, p.categories, cats.map(tagName).join(' '),
      p.labels, p.origins, p.origin_it, p.origin, p.ingredients_text_it, p.ingredients_text, p.quantity].filter(Boolean).join(' | ');
    data.type = guessType(corpus, cats);
    const origin = clean(p.origin_it || p.origins || p.origin);
    if (origin) data.origin = origin;
    if (!data.origin) {
      const country = (p.countries_tags || []).map(tagName).find(Boolean);
      if (country) data._country = country;
    }
  } else {
    const u = await upcItemDb(code);
    if (u) {
      source = 'UPCitemdb';
      data.name = u.title;
      data.winery = u.brand;
      data.producer = u.brand;
      corpus = [u.title, u.description].join(' | ');
      data.type = guessType(corpus);
    }
  }

  // Arricchimento: denominazione, vitigni, annata.
  if (corpus) {
    const den = findDenominazione(corpus);
    if (den) {
      data.origin = `${den.den} – ${den.region}`;
      if (den.grape) data.grape = den.grape;
      if (!data.type && den.type) data.type = den.type;
    }
    const grapes = findGrapes(corpus);
    if (!data.grape && grapes.length) data.grape = grapes.join(', ');
    data.vintage = findVintage(data.name || '') || findVintage(corpus);
  }

  const country = countryFromBarcode(code);
  if (!data.origin) data.origin = country || (data._country ? data._country : '');
  delete data._country;

  Object.keys(data).forEach(k => { if (!data[k]) delete data[k]; });
  return { found: Boolean(source), source, data, country };
}
