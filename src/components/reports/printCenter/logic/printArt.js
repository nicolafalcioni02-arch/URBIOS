// Decorazioni dei layout disegnate come immagini SVG a tinta piena.
// Safari, quando salva in PDF, rende nere le sfumature verso "transparent" e ignora le maschere CSS:
// per questo niente mask-image e niente gradienti trasparenti, ma immagini SVG con i colori già calcolati.
// I colori che dipendono dal colore guida arrivano al foglio come variabili CSS (artVars).

export const svg = (s) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' ${s}</svg>`)}")`;

// miscela due colori #rrggbb come color-mix(in srgb, a t%, b)
const rgb = (hex) => {
    const h = String(hex || '').replace('#', '');
    const f = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
    const n = parseInt(f, 16);
    return Number.isNaN(n) || f.length !== 6 ? [138, 90, 43] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const mix = (a, t, b = '#ffffff') => {
    const x = rgb(a);
    const y = rgb(b);
    return '#' + x.map((v, i) => Math.round(v * t + y[i] * (1 - t)).toString(16).padStart(2, '0')).join('');
};

// disegni a tratto
const doodles = (c) =>
    svg(`width='96' height='96' viewBox='0 0 96 96' fill='none' stroke='${c}' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'>
    <path d='M16 8c-6 0-8 7-8 13 0 7 4 11 8 11s8-4 8-11c0-6-2-13-8-13z'/><circle cx='16' cy='23' r='3.4'/>
    <path d='M56 10l17 7-19 19z'/><path d='M70 15l6-7M72 18l8-1M67 13l1-8'/>
    <path d='M8 70c7-12 19-14 26-12-2 10-14 17-26 12zM8 70l17-8'/>
    <path d='M66 54c-9 7-10 19-5 23 5 4 14 4 17-2 3-8-4-16-12-21zM66 54l1-7M63 60c-3 5-3 11 0 15'/>
    <path d='M40 40a7 5 0 0 1 14 0zM45 40v6h4v-6'/><circle cx='88' cy='40' r='1.3' fill='${c}'/><circle cx='40' cy='86' r='1.3' fill='${c}'/><circle cx='4' cy='46' r='1.3' fill='${c}'/>`);
const waveA = (c) => svg(`viewBox='0 0 210 40' preserveAspectRatio='none'><path fill='${c}' d='M0 0H210V20C182 36 150 10 112 22 78 33 40 34 0 16Z'/>`);
const waveB = (c) => svg(`viewBox='0 0 210 40' preserveAspectRatio='none'><path fill='${c}' d='M0 0H210V10C176 22 148 2 110 12 74 22 34 28 0 8Z'/>`);
const leaf = (c) => svg(`viewBox='0 0 24 24'><path d='M4 20C4 9 11 3 21 3c0 10-6 17-17 17z' fill='${c}' stroke='${c}' stroke-width='1.2'/>`);
const sprig = (c) =>
    svg(`viewBox='0 0 60 60' fill='${c}'><path d='M6 56C18 40 30 26 54 6' stroke='${c}' stroke-width='1.6' fill='none'/>
    <path d='M20 40c-8-1-13-6-14-13 8 0 13 5 14 13zM29 30c-1-8 2-14 9-17 1 8-2 13-9 17zM34 26c8 1 13 6 14 13-8 0-13-5-14-13zM42 17c-1-7 2-12 8-14 1 7-2 12-8 14z'/>`);
// puntino per le righe tratteggiate (piastrella 2mm x 1mm)
const dot = (c, r) => svg(`viewBox='0 0 2 1'><circle cx='1' cy='.5' r='${r}' fill='${c}'/>`);
// mezzo rettangolo tagliato in diagonale: 'tr' tiene l'angolo in alto a destra, 'bl' quello in basso a sinistra
export const tri = (c, corner) => svg(`viewBox='0 0 1 1' preserveAspectRatio='none'><path fill='${c}' d='${corner === 'tr' ? 'M0 0H1V1Z' : 'M0 0V1H1Z'}'/>`);

// ---- decorazioni fisse (non dipendono dal colore guida) ----

// tracciato del battito (Fresco)
export const ECG = svg(`viewBox='0 0 140 30' preserveAspectRatio='none' fill='none' stroke='#1b1b1f' stroke-width='1.3'><path d='M0 22H70L80 22 88 3 96 29 102 15 106 22H140'/>`);

// piatti che spuntano dai lati (Giocoso): foglio 210 x 297 mm; anelli come nel vecchio radial-gradient
const plateRings = (cx, cy, inner, outer) =>
    `<circle cx='${cx}' cy='${cy}' r='${outer + 0.55}' fill='#cdd8e5'/><circle cx='${cx}' cy='${cy}' r='${outer - 0.05}' fill='#f6f8fa'/>` +
    `<circle cx='${cx}' cy='${cy}' r='${inner + 0.65}' fill='#d9e3ee'/><circle cx='${cx}' cy='${cy}' r='${inner + 0.05}' fill='#fff'/>`;
export const GIOCOSO_PLATES = svg(
    `viewBox='0 0 210 297' preserveAspectRatio='none'>` +
        `<circle cx='203' cy='201.96' r='1.85' fill='#E5533D'/>` +
        `<circle cx='207' cy='178.2' r='3.05' fill='${mix('#6E9A2C', 0.75)}'/>` +
        plateRings(214, 190.08, 10, 15.05) +
        `<circle cx='4' cy='92.07' r='3.45' fill='#F2C94C'/>` +
        plateRings(-3, 100.98, 9, 13.55),
);

// cerchi pastello della copertina: foglio 210 x 297 mm
export const PASTELLO_CIRCLES = svg(
    `viewBox='0 0 210 297' preserveAspectRatio='none'>` +
        `<circle cx='201.6' cy='157.41' r='16.1' fill='#CADFF7'/>` +
        `<circle cx='142.8' cy='133.65' r='12.1' fill='#FAC9C3'/>` +
        `<circle cx='10.5' cy='172.26' r='15.1' fill='#C4E8CE'/>` +
        `<circle cx='172.2' cy='65.34' r='34.1' fill='#FFE6A6'/>`,
);

// evidenziatore sotto i titoli (Pastello): fascia dal from% al to% dell'altezza della riga
export const highlight = (c, from, to) => svg(`viewBox='0 0 1 100' preserveAspectRatio='none'><rect y='${from}' width='1' height='${to - from}' fill='${c}'/>`);

// ---- decorazioni che seguono il colore guida ----
const cache = new Map();
export const artVars = (accent) => {
    if (cache.has(accent)) return cache.get(accent);
    const line = mix(accent, 0.38); // --line del Planner
    const plannerBg = mix(accent, 0.24, '#F2F5F0');
    const mid = mix(accent, 0.42); // --mid del Naturale
    const soft = mix(accent, 0.13); // --soft del Naturale
    const v = {
        '--art-planner-doodles': doodles(mix(accent, 0.5, plannerBg)),
        '--art-planner-dot': dot(line, 0.36),
        '--art-planner-dot-s': dot(line, 0.34),
        '--art-planner-dot-l': dot(line, 0.4),
        '--art-geo-tri': tri(accent, 'bl'),
        '--art-wave-a': waveA(mid),
        '--art-wave-b': waveB(accent),
        '--art-leaf': leaf(accent),
        '--art-sprig-mid': sprig(mid),
        '--art-sprig-soft': sprig(soft),
        '--art-pastello-doodles': doodles(mix(accent, 0.5)),
        '--art-pastello-doodles-cover': doodles(mix(accent, 0.45)),
    };
    cache.set(accent, v);
    return v;
};
