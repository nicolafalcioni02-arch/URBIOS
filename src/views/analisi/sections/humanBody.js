import * as THREE from 'three';
import objM from '../../../assets/body_m.obj?raw';
import objF from '../../../assets/body_f.obj?raw';

// Corpo umano di base: mesh "body" di MakeHuman (CC0), in versione maschile e femminile (target caucasian-young). Qui lo si legge una volta e lo si deforma
// in base alle misure del paziente: circonferenze per fascia d'altezza (fianchi, vita, torace, collo,
// coscia, polpaccio, braccio). Le coordinate sono normalizzate: altezza totale = 1.

const TWO_PI = Math.PI * 2;
const LEVELS = 100;

const parse = (objText) => {
    const pos = [];
    const idx = [];
    objText.split('\n').forEach((l) => {
        if (l.startsWith('v ')) {
            const p = l.split(' ');
            pos.push(+p[1], +p[2], +p[3]);
        } else if (l.startsWith('f ')) {
            const t = l.trim().split(/\s+/).slice(1).map((n) => +n.split('/')[0] - 1);
            for (let i = 1; i < t.length - 1; i++) idx.push(t[0], t[i], t[i + 1]);
        }
    });
    let ymin = Infinity;
    let ymax = -Infinity;
    for (let i = 1; i < pos.length; i += 3) {
        ymin = Math.min(ymin, pos[i]);
        ymax = Math.max(ymax, pos[i]);
    }
    const HM = ymax - ymin;
    const P = new Float32Array(pos.length);
    for (let i = 0; i < pos.length; i += 3) {
        P[i] = pos[i] / HM;
        P[i + 1] = (pos[i + 1] - ymin) / HM;
        P[i + 2] = pos[i + 2] / HM;
    }
    return { P, idx: new Uint32Array(idx) };
};

const cache = {};
let base = null;
let tables = null;
const XC = 2.1 / 16.66; // semilarghezza del tronco: oltre è braccio
const CROTCH_U = 0.455; // sopra questa altezza le gambe sono unite al bacino

const buildTables = () => {
    const { P } = base;
    const bands = Array.from({ length: LEVELS + 1 }, () => ({ L: [], R: [], C: [] }));
    for (let i = 0; i < P.length; i += 3) {
        const x = P[i];
        const u = P[i + 1];
        const z = P[i + 2];
        const k = Math.round(u * LEVELS);
        const b = bands[k];
        if (u < CROTCH_U) (x < 0 ? b.L : b.R).push([x, z]);
        else if (Math.abs(x) < XC) b.C.push([x, z]);
    }
    const stat = (pts) => {
        if (pts.length < 3) return null;
        let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
        pts.forEach(([x, z]) => {
            x0 = Math.min(x0, x); x1 = Math.max(x1, x);
            z0 = Math.min(z0, z); z1 = Math.max(z1, z);
        });
        const a = (x1 - x0) / 2;
        const b = (z1 - z0) / 2;
        return { cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, circ: TWO_PI * Math.sqrt((a * a + b * b) / 2) };
    };
    tables = bands.map((b) => ({ L: stat(b.L), R: stat(b.R), C: stat(b.C) }));
};

const init = (sex) => {
    if (!cache[sex]) {
        base = parse(sex === 'F' ? objF : objM);
        buildTables();
        cache[sex] = { base, tables };
    }
    ({ base, tables } = cache[sex]);
};

// valore dalla tabella, cercando il livello valido più vicino
const at = (u, key) => {
    const k0 = Math.max(0, Math.min(LEVELS, Math.round(u * LEVELS)));
    for (let d = 0; d <= LEVELS; d++) {
        const a = tables[k0 + d]?.[key];
        if (a) return a;
        const b = tables[k0 - d]?.[key];
        if (b) return b;
    }
    return null;
};

// interpolazione lineare tra chiavi [u, valore], costante fuori intervallo
const interp = (keys, u) => {
    if (u <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
        if (u <= keys[i][0]) {
            const t = (u - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
            return keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * t;
        }
    }
    return keys[keys.length - 1][1];
};
const smooth = (a, b, x) => {
    const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
};

// m = { sesso, altezza(cm), peso(kg), collo, torace, vita, fianchi, braccio, coscia, polpaccio (cm) }
export const buildHumanGeometry = (m) => {
    init(m.sesso === 'F' ? 'F' : 'M');
    const H = (m.altezza || 175) / 100;
    const bmi = m.peso && m.altezza ? m.peso / (H * H) : 22;
    const g = Math.max(0.85, Math.min(1.5, Math.sqrt(bmi / 21.5))); // forma generale quando manca una misura

    // rapporto misura / mesh in un punto (circonferenza reale in m / circonferenza della mesh scalata a H)
    const ratio = (cm, u, key) => {
        const s = at(u, key);
        if (!cm || cm <= 0 || !s) return g;
        return Math.max(0.5, Math.min(2.2, cm / 100 / (s.circ * H)));
    };
    const rHip = ratio(m.fianchi, 0.5, 'C');
    const rWaist = ratio(m.vita, 0.6, 'C');
    const rChest = ratio(m.torace, 0.7, 'C');
    const rNeck = ratio(m.collo, 0.855, 'C');
    const rThigh = ratio(m.coscia, 0.38, 'R');
    const rCalf = ratio(m.polpaccio, 0.2, 'R');
    const arm = m.braccio > 0 ? Math.max(0.6, Math.min(2.2, m.braccio / 29)) : g; // braccio di base ~29 cm

    const torsoKeys = [[0.455, rHip], [0.5, rHip], [0.6, rWaist], [0.7, rChest], [0.79, rChest], [0.84, rNeck], [0.86, rNeck]];
    const legKeys = [[0.0, 1 + (rCalf - 1) * 0.5], [0.12, rCalf], [0.22, rCalf], [0.3, (rCalf + rThigh) / 2], [0.39, rThigh], [0.455, rHip]];

    const src = base.P;
    const out = new Float32Array(src.length);
    const armPts = [];
    const bins = Array.from({ length: LEVELS + 1 }, () => ({ L: [], R: [], C: [] }));
    const sh = { x: 2.9 / 16.66, y: (4.33 + 8.1676) / 16.66 }; // spalla (u = (y+8.1676)/16.66)
    const hand = { x: 4.7 / 16.66, y: (1.8 + 8.1676) / 16.66 };
    const rShoulder = interp(torsoKeys, 0.75);
    const dir = new THREE.Vector2(hand.x - sh.x, hand.y - sh.y).normalize();

    for (let i = 0; i < src.length; i += 3) {
        let x = src[i];
        const u = src[i + 1];
        let z = src[i + 2];
        const ax = Math.abs(x);
        const sgn = x < 0 ? -1 : 1;

        // braccia: vengono prima di tutto, anche le dita sotto il livello del bacino
        const isArm = u > 0.3 && u < 0.82 ? smooth(XC * 0.95, XC * 1.25, ax) : 0;
        if (isArm > 0) {
            const c = at(Math.max(u, 0.5), 'C');
            const cz = c ? c.cz : 0;
            const rT = interp(torsoKeys, u);
            const tx = x * rT;
            const tz = cz + (z - cz) * rT;
            // ancora alla spalla spostata, scala sul piano perpendicolare all'asse del braccio
            const dx = ax - sh.x;
            const dy = u - sh.y;
            const along = dx * dir.x + dy * dir.y;
            const px = dx - along * dir.x;
            const py = dy - along * dir.y;
            const nx = sh.x * rShoulder + along * dir.x + px * arm;
            const ny = sh.y + along * dir.y + py * arm;
            const az = cz + (z - cz) * (arm + rShoulder) * 0.5;
            out[i] = sgn * (isArm * nx + (1 - isArm) * Math.abs(tx));
            out[i + 1] = isArm * ny + (1 - isArm) * u;
            out[i + 2] = isArm * az + (1 - isArm) * tz;
            if (sgn > 0 && isArm > 0.99 && along > 0.06 && along < 0.09) armPts.push([out[i], out[i + 1], out[i + 2]]);
            continue;
        }

        if (u < CROTCH_U + 0.02) {
            // gambe: scala attorno all'asse di ciascuna gamba
            const s = at(u, sgn < 0 ? 'L' : 'R');
            const r = interp(legKeys, u);
            const mix = smooth(CROTCH_U - 0.03, CROTCH_U + 0.02, u); // verso il centro del bacino
            const cx = s ? s.cx * (1 - mix) : 0;
            const cz = s ? s.cz : 0;
            x = cx + (x - cx) * r;
            z = cz + (z - cz) * r;
            if (u < CROTCH_U - 0.03) bins[Math.round(u * LEVELS)][sgn < 0 ? 'L' : 'R'].push([x, z]);
        } else if (u < 0.9) {
            // tronco
            const c = at(u, 'C');
            const cz = c ? c.cz : 0;
            const rT = u < 0.86 ? interp(torsoKeys, u) : 1 + (rNeck - 1) * (1 - smooth(0.86, 0.9, u)); // sopra il collo la testa resta com'è
            x = x * rT;
            z = cz + (z - cz) * rT;
            bins[Math.round(u * LEVELS)].C.push([x, z]);
        }
        out[i] = x;
        out[i + 1] = u;
        out[i + 2] = z;
    }

    // punti di misura: ellisse che segue la superficie deformata (coordinate già in metri)
    const ell = (pts, u) => {
        if (pts.length < 3) return null;
        let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
        pts.forEach(([x, z]) => {
            x0 = Math.min(x0, x); x1 = Math.max(x1, x);
            z0 = Math.min(z0, z); z1 = Math.max(z1, z);
        });
        return { y: u * H, cx: ((x0 + x1) / 2) * H, cz: ((z0 + z1) / 2) * H, a: ((x1 - x0) / 2) * H, b: ((z1 - z0) / 2) * H };
    };
    const near = (u, key) => {
        const k0 = Math.round(u * LEVELS);
        for (let d = 0; d < 6; d++) {
            for (const k of [k0 + d, k0 - d]) {
                const e = bins[k] && ell(bins[k][key], k / LEVELS);
                if (e) return e;
            }
        }
        return null;
    };
    const sites = {
        collo: near(0.855, 'C'),
        torace: near(0.7, 'C'),
        vita: near(0.6, 'C'),
        fianchi: near(0.5, 'C'),
        coscia: near(0.38, 'L'),
        polpaccio: near(0.2, 'L'),
        at: near,
        // braccio: anello perpendicolare all'asse della spalla (a metà del braccio superiore)
        arm: armPts.length
            ? { c: armPts.reduce((a, p) => [a[0] + p[0] / armPts.length, a[1] + p[1] / armPts.length, a[2] + p[2] / armPts.length], [0, 0, 0]).map((v) => v * H), dir: [dir.x, dir.y] }
            : null,
    };

    // scala all'altezza reale
    for (let i = 0; i < out.length; i++) out[i] *= H;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(out, 3));
    geo.setIndex(new THREE.BufferAttribute(base.idx, 1));
    geo.computeVertexNormals();
    return { geo, sites };
};
