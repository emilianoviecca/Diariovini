// Copia i file della web app nella cartella www/ usata da Capacitor
// e aggiunge il runtime Capacitor (serve solo nell'app Android).
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const items = ['index.html', 'manifest.webmanifest', 'css', 'js', 'img', 'icons', 'vendor'];
rmSync('www', { recursive: true, force: true });
mkdirSync('www');
for (const it of items) cpSync(it, `www/${it}`, { recursive: true });
cpSync('node_modules/@capacitor/core/dist/capacitor.js', 'www/vendor/capacitor.js');
const html = readFileSync('www/index.html', 'utf8')
  .replace('<script type="module" src="js/app.js"></script>', '<script src="vendor/capacitor.js"></script>\n  <script type="module" src="js/app.js"></script>');
writeFileSync('www/index.html', html);
console.log('www pronta');
