// Lettura dei valori scritti a mano dal professionista ("8-12", "45''", "1'30", "20 min", "3-1-1-0", "90s"...).
const num = (s) => parseFloat(String(s).replace(',', '.'));

// ripetizioni o durata di una serie. { reps, seconds, range }
export const parseReps = (v) => {
    const t = String(v === undefined || v === null ? '' : v)
        .trim()
        .toLowerCase()
        .replace(',', '.');
    if (!t) return { reps: null, seconds: null };
    let m = t.match(/^(\d+(?:\.\d+)?)\s*(?:''|"|s|sec|secondi)$/);
    if (m) return { reps: null, seconds: num(m[1]) };
    m = t.match(/^(\d+)\s*'\s*(\d+)\s*(?:''|"|s)?$/);
    if (m) return { reps: null, seconds: num(m[1]) * 60 + num(m[2]) };
    m = t.match(/^(\d+(?:\.\d+)?)\s*(?:'|min|m|minuti)$/);
    if (m) return { reps: null, seconds: num(m[1]) * 60 };
    m = t.match(/^(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)/);
    if (m) return { reps: (num(m[1]) + num(m[2])) / 2, seconds: null, range: [num(m[1]), num(m[2])] };
    m = t.match(/^(\d+(?:\.\d+)?)/);
    if (m) return { reps: num(m[1]), seconds: null };
    return { reps: null, seconds: null };
};

// recupero in secondi. "90''" 90 · "90" 90 · "2" 120 (un numero piccolo = minuti) · "1'30" 90 · "2 min" 120
export const parseRest = (v) => {
    const t = String(v === undefined || v === null ? '' : v)
        .trim()
        .toLowerCase()
        .replace(',', '.');
    if (!t) return null;
    let m = t.match(/^(\d+)\s*'\s*(\d+)\s*(?:''|"|s)?$/);
    if (m) return num(m[1]) * 60 + num(m[2]);
    m = t.match(/^(\d+(?:\.\d+)?)\s*(?:'|min|m|minuti)$/);
    if (m) return num(m[1]) * 60;
    m = t.match(/^(\d+(?:\.\d+)?)\s*(?:''|"|s|sec|secondi)?$/);
    if (m) {
        const n = num(m[1]);
        return /(?:''|"|s|sec)/.test(t) ? n : n <= 10 ? n * 60 : n;
    }
    return null;
};

// tempo di esecuzione "3-1-1-0" (eccentrica-pausa-concentrica-pausa): secondi per ripetizione. X = esplosivo (~1 s)
export const parseTempo = (v) => {
    const t = String(v === undefined || v === null ? '' : v)
        .trim()
        .toLowerCase();
    if (!t) return null;
    const parts = t.split(/[-–./\s]+/).filter(Boolean);
    if (parts.length < 2) return null;
    const sec = parts.map((p) => (p === 'x' ? 1 : /^\d+(\.\d+)?$/.test(p) ? parseFloat(p) : NaN));
    return sec.some(Number.isNaN) ? null : sec.reduce((a, b) => a + b, 0);
};

export const numOrNull = (v) => {
    const n = num(v === undefined || v === null || v === '' ? NaN : v);
    return Number.isFinite(n) ? n : null;
};

export const fmtDuration = (sec) => {
    if (!Number.isFinite(sec)) return '';
    const m = Math.round(sec / 60);
    return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min` : `${m} min`;
};
