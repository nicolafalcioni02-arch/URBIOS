// Lettura del QR con la fotocamera (jsQR, tutto sul dispositivo: nessuna immagine esce). Ritorna una funzione stop().
import jsQR from 'jsqr';

export const startScan = async (video, onText) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    video.srcObject = stream;
    video.setAttribute('playsinline', 'true');
    await video.play();
    const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });
    let stopped = false, timer = null;
    const stop = () => { stopped = true; clearTimeout(timer); stream.getTracks().forEach((t) => t.stop()); video.srcObject = null; };
    const tick = () => {
        if (stopped) return;
        if (video.videoWidth) {
            const w = Math.min(640, video.videoWidth), h = Math.round((video.videoHeight * w) / video.videoWidth);
            canvas.width = w; canvas.height = h;
            ctx.drawImage(video, 0, 0, w, h);
            const code = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'attemptBoth' });
            if (code && code.data) { stop(); onText(code.data); return; }
        }
        timer = setTimeout(tick, 250);
    };
    tick();
    return stop;
};
