# Diario Vini 🍷

Web app (PWA) per tenere il diario dei vini bevuti, pensata per il telefono.

- **Foto dell'etichetta** dalla fotocamera o dalla galleria (se la foto della galleria contiene data e posizione, vengono usate quelle)
- **Data** automatica dal telefono, modificabile
- **Luogo** automatico dal GPS, trasformato in indirizzo leggibile (OpenStreetMap)
- **Codice a barre**: scansione dal vivo, da foto o a mano → recupera nome, cantina, produttore, annata, provenienza, vitigno e gradazione da [Open Food Facts](https://world.openfoodfacts.org) (con ripiego su UPCitemdb), arricchiti da una tabella di oltre 150 denominazioni (es. Barolo → Nebbiolo, Piemonte)
- **Lettura etichetta con AI** (facoltativa): con una chiave API Anthropic, Claude legge la foto e compila i campi mancanti
- Voto a stelle, note, prezzo, ricerca, **mappa** dei luoghi, backup/ripristino JSON ed export CSV
- Funziona offline (tranne le ricerche online); i dati restano **solo sul dispositivo** (IndexedDB)

## Installazione sul telefono
1. Apri l'indirizzo GitHub Pages del repo in Chrome (Android) o Safari (iPhone)
2. Menu ⋮ → **Aggiungi a schermata Home** / **Installa app**

## Struttura
```
index.html            interfaccia
css/style.css         stile (chiaro/scuro, accessibile)
js/app.js             logica e navigazione
js/db.js              archivio locale IndexedDB
js/media.js           foto, EXIF, GPS, indirizzo
js/scanner.js         lettura codici a barre (BarcodeDetector + ZXing)
js/lookup.js          ricerca da codice a barre
js/wine-knowledge.js  denominazioni, vitigni, prefissi GS1
js/ai.js              lettura etichetta con Claude (opzionale)
sw.js                 service worker (offline)
vendor/               exifr, ZXing, Leaflet (licenze incluse)
```
