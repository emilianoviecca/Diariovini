// Sorsi — archivio locale (IndexedDB): i vini e le foto restano sul dispositivo.
const DB_NAME = 'diariovini';
const DB_VERSION = 1;
const STORE = 'wines';

let dbPromise;

function open() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const s = db.createObjectStore(STORE, { keyPath: 'id' });
        s.createIndex('date', 'date');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(mode, fn) {
  return open().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    let result;
    Promise.resolve(fn(store)).then(r => { result = r; });
    t.oncomplete = () => resolve(result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  }));
}

const reqP = req => new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });

export const db = {
  async all() {
    const items = await tx('readonly', s => reqP(s.getAll()));
    return items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  },
  get(id) { return tx('readonly', s => reqP(s.get(id))); },
  put(wine) { return tx('readwrite', s => reqP(s.put(wine))); },
  delete(id) { return tx('readwrite', s => reqP(s.delete(id))); },
  async putMany(list) {
    return tx('readwrite', s => { list.forEach(w => s.put(w)); });
  },
};

export function newId() {
  return (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
}

export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const already = await navigator.storage.persisted();
      if (!already) await navigator.storage.persist();
    }
  } catch { /* non supportato */ }
}
