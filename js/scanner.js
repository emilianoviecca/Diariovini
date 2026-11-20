// Scansione codice a barre: BarcodeDetector nativo (Android/Chrome) con ripiego su ZXing (iPhone/Safari).
const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];
let zxingLoading;

async function nativeDetector() {
  if (!('BarcodeDetector' in window)) return null;
  try {
    const supported = await window.BarcodeDetector.getSupportedFormats();
    const formats = FORMATS.filter(f => supported.includes(f));
    if (!formats.length) return null;
    return new window.BarcodeDetector({ formats });
  } catch { return null; }
}

function loadZXing() {
  if (window.ZXing) return Promise.resolve(window.ZXing);
  if (!zxingLoading) {
    zxingLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'vendor/zxing.min.js';
      s.onload = () => resolve(window.ZXing);
      s.onerror = () => reject(new Error('Impossibile caricare il lettore di codici'));
      document.head.appendChild(s);
    });
  }
  return zxingLoading;
}

function zxingReader(ZX, tryHarder = false) {
  const hints = new Map();
  hints.set(ZX.DecodeHintType.POSSIBLE_FORMATS, [ZX.BarcodeFormat.EAN_13, ZX.BarcodeFormat.EAN_8, ZX.BarcodeFormat.UPC_A, ZX.BarcodeFormat.UPC_E]);
  if (tryHarder) hints.set(ZX.DecodeHintType.TRY_HARDER, true);
  return new ZX.BrowserMultiFormatReader(hints, 200);
}

/** Verifica la cifra di controllo EAN/UPC per scartare letture sbagliate. */
export function validEan(code) {
  if (!/^\d{8}$|^\d{12,14}$/.test(code)) return false;
  const d = code.split('').map(Number);
  const check = d.pop();
  const sum = d.reverse().reduce((acc, n, i) => acc + n * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}

/**
 * Avvia la scansione dal vivo dentro il <dialog>. Restituisce una Promise con il codice letto
 * (o null se l'utente chiude).
 */
export function scanLive({ dialog, video, closeBtn, torchBtn, hint }) {
  return new Promise(async (resolve) => {
    let stream, raf, stopped = false, zxReader;
    const finish = (code) => {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(raf);
      if (zxReader) try { zxReader.reset(); } catch { /* */ }
      if (stream) stream.getTracks().forEach(t => t.stop());
      video.srcObject = null;
      closeBtn.onclick = null; torchBtn.onclick = null;
      dialog.removeEventListener('cancel', onCancel);
      if (dialog.open) dialog.close();
      if (code && navigator.vibrate) navigator.vibrate(80);
      resolve(code || null);
    };
    const onCancel = (e) => { e.preventDefault(); finish(null); };
    dialog.addEventListener('cancel', onCancel);
    closeBtn.onclick = () => finish(null);
    hint.textContent = 'Inquadra il codice a barre della bottiglia';
    torchBtn.hidden = true;
    dialog.showModal();
    closeBtn.focus();

    try {
      const detector = await nativeDetector();
      if (detector) {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
        if (stopped) { stream.getTracks().forEach(t => t.stop()); return; }
        video.srcObject = stream;
        await video.play();
        setupTorch(stream, torchBtn);
        let last = '', hits = 0, busy = false;
        const tick = async () => {
          if (stopped) return;
          if (!busy && video.readyState >= 2) {
            busy = true;
            try {
              const codes = await detector.detect(video);
              const c = codes.map(x => x.rawValue).find(validEan);
              if (c) { hits = c === last ? hits + 1 : 1; last = c; if (hits >= 2) return finish(c); }
            } catch { /* frame non leggibile */ }
            busy = false;
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
      } else {
        hint.textContent = 'Avvio fotocamera…';
        const ZX = await loadZXing();
        if (stopped) return;
        zxReader = zxingReader(ZX);
        hint.textContent = 'Inquadra il codice a barre della bottiglia';
        await zxReader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } }, audio: false },
          video,
          (result) => {
            if (result && validEan(result.getText())) finish(result.getText());
          }
        );
        stream = video.srcObject;
        if (stream) setupTorch(stream, torchBtn);
      }
    } catch (err) {
      hint.textContent = err && err.name === 'NotAllowedError'
        ? 'Permesso fotocamera negato. Abilitalo nelle impostazioni del browser.'
        : 'Fotocamera non disponibile. Prova "Da foto" o scrivi il codice a mano.';
    }
  });
}

function setupTorch(stream, btn) {
  const track = stream.getVideoTracks()[0];
  const caps = track && track.getCapabilities ? track.getCapabilities() : {};
  if (!caps.torch) return;
  let on = false;
  btn.hidden = false;
  btn.setAttribute('aria-pressed', 'false');
  btn.onclick = async () => {
    on = !on;
    try { await track.applyConstraints({ advanced: [{ torch: on }] }); btn.setAttribute('aria-pressed', String(on)); } catch { /* */ }
  };
}

/** Legge il codice a barre da una foto (es. scattata in precedenza). */
export async function scanImage(file) {
  const detector = await nativeDetector();
  if (detector) {
    try {
      const bmp = await createImageBitmap(file);
      const codes = await detector.detect(bmp);
      const c = codes.map(x => x.rawValue).find(validEan);
      if (c) return c;
    } catch { /* passa a ZXing */ }
  }
  const ZX = await loadZXing();
  const reader = zxingReader(ZX, true);
  const url = URL.createObjectURL(file);
  try {
    const res = await reader.decodeFromImageUrl(url);
    const c = res && res.getText();
    return c && validEan(c) ? c : null;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
    try { reader.reset(); } catch { /* */ }
  }
}
