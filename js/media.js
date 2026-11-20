// Foto, EXIF e posizione.

/** Ridimensiona l'immagine (lato lungo max `max`) e la restituisce come Blob JPEG. */
export async function compressImage(file, max = 1600, quality = 0.82) {
  const bmp = await loadBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(bmp, 0, 0, w, h);
  if (bmp.close) bmp.close();
  return new Promise(res => canvas.toBlob(b => res(b), 'image/jpeg', quality));
}

async function loadBitmap(file) {
  if ('createImageBitmap' in window) {
    try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch { /* fallback */ }
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { resolve(img); URL.revokeObjectURL(img.src); };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/** Legge data di scatto e coordinate GPS dalla foto, se presenti. */
export async function readExif(file) {
  if (!window.exifr) return {};
  try {
    const data = await window.exifr.parse(file, { tiff: true, exif: true, gps: true, pick: ['DateTimeOriginal', 'CreateDate', 'latitude', 'longitude'] });
    if (!data) return {};
    const date = data.DateTimeOriginal || data.CreateDate;
    return {
      date: date instanceof Date && !isNaN(date) ? date : null,
      lat: typeof data.latitude === 'number' ? data.latitude : null,
      lon: typeof data.longitude === 'number' ? data.longitude : null,
    };
  } catch {
    return {};
  }
}

/** Posizione attuale dal GPS del telefono. */
export function getPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('Geolocalizzazione non disponibile'));
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy }),
      err => reject(new Error(err.code === 1 ? 'Permesso posizione negato' : 'Posizione non disponibile')),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
}

/** Coordinate -> nome del luogo leggibile (OpenStreetMap Nominatim). */
export async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=it`;
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error('Indirizzo non trovato');
  const j = await r.json();
  const a = j.address || {};
  const town = a.city || a.town || a.village || a.hamlet || a.municipality || a.county || '';
  const poi = j.name && !/^\d/.test(j.name) && j.name !== town ? j.name : '';
  const street = a.road ? `${a.road}${a.house_number ? ' ' + a.house_number : ''}` : '';
  const parts = [poi || street, town].filter(Boolean);
  if (a.country_code && a.country_code !== 'it' && a.country) parts.push(a.country);
  return parts.join(', ') || j.display_name || '';
}

export function blobToDataURL(blob) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });
}

export async function dataURLToBlob(url) {
  const r = await fetch(url);
  return r.blob();
}
