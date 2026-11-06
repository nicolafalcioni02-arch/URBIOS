// Convertitore di unità del laboratorio (pura). Ogni unità ha il fattore verso l'unità base della sua grandezza.
// Con il PM (g/mol) si passa anche tra moli e grammi e tra molarità e g/L.
export const DIMS = {
    mol: { label: 'Quantità di sostanza', base: 'mol', units: { mol: 1, mmol: 1e-3, 'µmol': 1e-6, nmol: 1e-9, pmol: 1e-12 } },
    g: { label: 'Massa', base: 'g', units: { kg: 1e3, g: 1, mg: 1e-3, 'µg': 1e-6, ng: 1e-9, pg: 1e-12 } },
    L: { label: 'Volume', base: 'L', units: { L: 1, mL: 1e-3, 'µL': 1e-6 } },
    M: { label: 'Concentrazione molare', base: 'M', units: { M: 1, mM: 1e-3, 'µM': 1e-6, nM: 1e-9, pM: 1e-12 } },
    gL: { label: 'Concentrazione in massa', base: 'g/L', units: { 'g/mL': 1e3, 'g/L': 1, 'mg/mL': 1, 'mg/L': 1e-3, 'µg/mL': 1e-3, 'µg/µL': 1, 'µg/L': 1e-6, 'ng/µL': 1e-3, 'ng/mL': 1e-6 } },
};
export const dimOf = (unit) => Object.keys(DIMS).find((k) => unit in DIMS[k].units);
const PAIR = { mol: 'g', g: 'mol', M: 'gL', gL: 'M' }; // coppie legate dal PM

const num = (v) => { const x = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(x) ? x : null; };

// restituisce [{ dim, label, rows: [{ unit, value }], needsPm }] per il valore dato
export const convertAll = (value, unit, pm) => {
    const v = num(value);
    const d = dimOf(unit);
    if (v === null || !d) return [];
    const base = v * DIMS[d].units[unit];
    const out = [{ dim: d, label: DIMS[d].label, rows: Object.entries(DIMS[d].units).map(([u, f]) => ({ unit: u, value: base / f })) }];
    const p = PAIR[d];
    if (p) {
        const w = num(pm);
        if (w && w > 0) {
            const b2 = d === 'mol' || d === 'M' ? base * w : base / w; // mol→g, M→g/L: × PM; g→mol, g/L→M: ÷ PM
            out.push({ dim: p, label: DIMS[p].label, rows: Object.entries(DIMS[p].units).map(([u, f]) => ({ unit: u, value: b2 / f })) });
        } else out.push({ dim: p, label: DIMS[p].label, rows: [], needsPm: true });
    }
    return out;
};

const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export const fmtSci = (x) => {
    if (!Number.isFinite(x)) return '';
    if (x === 0) return '0';
    const a = Math.abs(x);
    const s = a >= 1e7 || a < 1e-4 ? x.toExponential(3).replace(/\.?0+e/, 'e').replace('e+', '×10^').replace('e', '×10^').replace(/\^(-?\d+)/, (_, n) => [...n].map((c) => SUP[c]).join('')) : String(parseFloat(x.toPrecision(6)));
    return s.replace('.', ',');
};

// Quanti grammi servono: pm (g/mol), concentrazione (valore+unità molare), volume (valore+unità).
// Oppure «stessa concentrazione»: si parte da quanti grammi di una molecola (pm0) erano in un volume (v0) e si trova la massa della nuova molecola.
const toBase = (v, u, dim) => { const x = num(v); return x === null ? null : x * DIMS[dim].units[u]; };
export const gramsFor = ({ pm, conc, cu, vol, vu }) => {
    const p = num(pm); const c = toBase(conc, cu, 'M'); const v = toBase(vol, vu, 'L');
    if (!p || p <= 0 || c === null || v === null) return null;
    const mol = c * v;
    return { grams: mol * p, mol };
};
export const sameConc = ({ pm0, g0, v0, v0u, pm, vol, vu }) => {
    const p0 = num(pm0); const g = toBase(g0, 'g', 'g'); const vv0 = toBase(v0, v0u, 'L');
    if (!p0 || p0 <= 0 || g === null || !vv0 || vv0 <= 0) return null; // concentrazione di partenza
    const molar = g / p0 / vv0; // mol/L
    const out = gramsFor({ pm, conc: molar, cu: 'M', vol, vu });
    return out ? { ...out, molar } : null;
};
// scrive una massa con l'unità più comoda (1–1000)
export const fmtMass = (g) => {
    if (!Number.isFinite(g) || g === 0) return '0 g';
    const list = [['kg', 1e3], ['g', 1], ['mg', 1e-3], ['µg', 1e-6], ['ng', 1e-9]];
    const [u, f] = list.find(([, f]) => Math.abs(g) >= f) || list[list.length - 1];
    return `${fmtSci(g / f)} ${u}`;
};
export const fmtMolar = (m) => {
    const list = [['M', 1], ['mM', 1e-3], ['µM', 1e-6], ['nM', 1e-9], ['pM', 1e-12]];
    const [u, f] = list.find(([, f]) => Math.abs(m) >= f) || list[list.length - 1];
    return `${fmtSci(m / f)} ${u}`;
};

// valore come lo scriverebbe una bilancia: unità comoda, 3 decimali (es. 29,220 mg)
export const balanceRead = (g) => {
    if (!Number.isFinite(g)) return { text: '0,000', unit: 'g' };
    const list = [['kg', 1e3], ['g', 1], ['mg', 1e-3], ['µg', 1e-6], ['ng', 1e-9]];
    const [u, f] = list.find(([, f]) => Math.abs(g) >= f) || list[list.length - 1];
    return { text: (g / f).toFixed(3).replace('.', ','), unit: u };
};

// Nomi estesi (singolare, plurale) di ogni unità, per la scheda «i»
export const UNIT_NAMES = {
    kg: ['chilogrammo', 'chilogrammi'], g: ['grammo', 'grammi'], mg: ['milligrammo', 'milligrammi'], 'µg': ['microgrammo', 'microgrammi'], ng: ['nanogrammo', 'nanogrammi'], pg: ['picogrammo', 'picogrammi'],
    mol: ['mole', 'moli'], mmol: ['millimole', 'millimoli'], 'µmol': ['micromole', 'micromoli'], nmol: ['nanomole', 'nanomoli'], pmol: ['picomole', 'picomoli'],
    L: ['litro', 'litri'], mL: ['millilitro', 'millilitri'], 'µL': ['microlitro', 'microlitri'],
    M: ['molare', 'molare'], mM: ['millimolare', 'millimolare'], 'µM': ['micromolare', 'micromolare'], nM: ['nanomolare', 'nanomolare'], pM: ['picomolare', 'picomolare'],
};
// frasi tipo «10 milligrammi sono 0,01 grammi» per ogni unità di una grandezza (rispetto all'unità base)
export const unitSentences = (dim, n = 10) => {
    const d = DIMS[dim];
    const baseUnit = Object.keys(d.units).find((u) => d.units[u] === 1);
    const names = UNIT_NAMES[baseUnit] || [baseUnit, baseUnit];
    return Object.entries(d.units).filter(([u]) => u !== baseUnit && UNIT_NAMES[u]).map(([u, f]) => ({ unit: u, name: UNIT_NAMES[u][0], text: `${n} ${UNIT_NAMES[u][1]} sono ${fmtSci(n * f)} ${names[1]}`, base: baseUnit }));
};
