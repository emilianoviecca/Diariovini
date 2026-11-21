// Personalizza il progetto Android generato da Capacitor:
// permessi (fotocamera, posizione), icone, schermata d'avvio, numero di versione.
import { readFileSync, writeFileSync, cpSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const app = 'android/app';
const res = `${app}/src/main/res`;
const OCHRE = '#C68D2C';
const SAND = '#F0DEB3';
const SPLASH = '#F6EDDD';

// 1. Permessi
const manifestPath = `${app}/src/main/AndroidManifest.xml`;
let manifest = readFileSync(manifestPath, 'utf8');
const perms = [
  '<uses-permission android:name="android.permission.CAMERA" />',
  '<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />',
  '<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />',
  '<uses-feature android:name="android.hardware.camera" android:required="false" />',
  '<uses-feature android:name="android.hardware.location.gps" android:required="false" />',
].filter(p => !manifest.includes(p));
manifest = manifest.replace('</manifest>', `    ${perms.join('\n    ')}\n</manifest>`);
writeFileSync(manifestPath, manifest);

// 2. Icone
cpSync('android-res', res, { recursive: true });
writeFileSync(`${res}/values/ic_launcher_background.xml`,
  `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${SAND}</color>\n    <color name="splash_background">${SPLASH}</color>\n</resources>\n`);
// rimuove il primo piano vettoriale di default (ha la precedenza sui PNG)
rmSync(`${res}/drawable-v24/ic_launcher_foreground.xml`, { force: true });

// 3. Schermata d'avvio: fondo sabbia con l'icona al centro
for (const dir of readdirSync(res)) {
  const f = join(res, dir, 'splash.png');
  if (existsSync(f)) rmSync(f);
}
writeFileSync(`${res}/drawable/splash.xml`, `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background" />
    <item><bitmap android:gravity="center" android:src="@mipmap/ic_launcher_foreground" /></item>
</layer-list>
`);
const stylesPath = `${res}/values/styles.xml`;
let styles = readFileSync(stylesPath, 'utf8');
if (!styles.includes('windowSplashScreenBackground')) {
  styles = styles.replace('<item name="android:background">@drawable/splash</item>',
    `<item name="android:background">@drawable/splash</item>
        <item name="windowSplashScreenBackground">@color/splash_background</item>
        <item name="windowSplashScreenAnimatedIcon">@mipmap/ic_launcher_foreground</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>`);
}
styles = styles
  .replace('<item name="colorPrimary">@color/colorPrimary</item>', `<item name="colorPrimary">${OCHRE}</item>`)
  .replace('<item name="colorPrimaryDark">@color/colorPrimaryDark</item>', `<item name="colorPrimaryDark">${OCHRE}</item>`);
writeFileSync(stylesPath, styles);

// 4. Firma: sempre la stessa chiave (android-signing/debug.keystore), così gli aggiornamenti si installano sopra
{
  const g = `${app}/build.gradle`;
  let t = readFileSync(g, 'utf8');
  if (!t.includes('android-signing/debug.keystore')) {
    t = t.replace(/android\s*\{/, `android {
    signingConfigs {
        debug {
            storeFile file('../../android-signing/debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`);
    writeFileSync(g, t);
  }
}

// 5. Versione (numero build da GitHub Actions)
const build = process.env.BUILD_NUMBER || '1';
const gradlePath = `${app}/build.gradle`;
let gradle = readFileSync(gradlePath, 'utf8');
gradle = gradle.replace(/versionCode \d+/, `versionCode ${build}`).replace(/versionName "[^"]*"/, `versionName "1.0.${build}"`);
writeFileSync(gradlePath, gradle);

console.log(`Android personalizzato (versione 1.0.${build})`);
