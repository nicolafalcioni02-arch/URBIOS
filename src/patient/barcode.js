// Lettura dei codici a barre dei prodotti (EAN-13/8, UPC) con la fotocamera: tutto sul telefono, nessuna immagine esce.
// Usa il lettore del telefono (BarcodeDetector) se c'è; altrimenti ZXing, caricato solo in quel caso. Ritorna una funzione stop().
export const validEan = (s) => {
    if (!/^\d{8}$|^\d{12,14}$/.test(s)) return false;
    const d = s.split('').map(Number), c = d.pop();
    const sum = d.reverse().reduce((t, x, i) => t + x * (i % 2 ? 1 : 3), 0);
    return (10 - (sum % 10)) % 10 === c;
};

export const startBarcode = async (video, onCode) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    video.srcObject = stream;
    video.setAttribute('playsinline', 'true');
    await video.play();
    let stopped = false, timer = null;
    const stop = () => { stopped = true; clearTimeout(timer); stream.getTracks().forEach((t) => t.stop()); video.srcObject = null; };
    let read;
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        const det = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
        read = async () => { const r = await det.detect(video); return r[0] ? r[0].rawValue : null; };
    } else {
        const Z = await import('@zxing/library');
        const hints = new Map([[Z.DecodeHintType.POSSIBLE_FORMATS, [Z.BarcodeFormat.EAN_13, Z.BarcodeFormat.EAN_8, Z.BarcodeFormat.UPC_A, Z.BarcodeFormat.UPC_E]], [Z.DecodeHintType.TRY_HARDER, true]]);
        const reader = new Z.MultiFormatReader(); reader.setHints(hints);
        const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });
        read = async () => {
            if (!video.videoWidth) return null;
            const w = Math.min(800, video.videoWidth), h = Math.round((video.videoHeight * w) / video.videoWidth);
            canvas.width = w; canvas.height = h; ctx.drawImage(video, 0, 0, w, h);
            try { return reader.decode(new Z.BinaryBitmap(new Z.HybridBinarizer(new Z.HTMLCanvasElementLuminanceSource(canvas)))).getText(); } catch (e) { return null; }
        };
    }
    let last = '', hits = 0;
    const tick = async () => {
        if (stopped) return;
        let code = null; try { code = await read(); } catch (e) { /* fotogramma non leggibile */ }
        if (stopped) return;
        // il codice vale solo se è corretto (cifra di controllo) e letto due volte di fila: evita letture sbagliate
        if (code && validEan(code)) { hits = code === last ? hits + 1 : 1; last = code; if (hits >= 2) { stop(); onCode(code); return; } } else { hits = 0; last = ''; }
        timer = setTimeout(tick, 150);
    };
    tick();
    return stop;
};
