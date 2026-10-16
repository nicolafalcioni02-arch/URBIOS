// Agenda: funzioni pure (niente React). Gli appuntamenti stanno in db.agenda:
//   { id, start: 'AAAA-MM-GGTHH:MM' (ora locale), dur: minuti, pid: id paziente | '', titolo, tipo, luogo, note, stato }
// Le impostazioni vengono da db.utente, cioè dagli stessi dati che il professionista inserisce per il contratto
// (Impostazioni → Impostazioni operative / Dati professionali): orari_studio, durata_prima_visita, durata_controllo,
// policy_cancellazione, indirizzo_studio, sedi_multiple, lettera_compenso.

export const TIPI = [
    { id: 'prima', label: 'Prima visita', color: '#2F54EB' },
    { id: 'controllo', label: 'Controllo', color: '#1F8A5B' },
    { id: 'altro', label: 'Altro', color: '#B7791F' },
];
export const STATI = [
    { id: 'confermato', label: 'Confermato' },
    { id: 'completato', label: 'Completato' },
    { id: 'annullato', label: 'Annullato' },
    { id: 'assente', label: 'Non presentato' },
];
export const tipoOf = (id) => TIPI.find((t) => t.id === id) || TIPI[2];

const pad = (n) => String(n).padStart(2, '0');
export const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k) => {
    const [y, m, d] = k.split('-').map(Number);
    return new Date(y, m - 1, d);
};
export const startOf = (a) => {
    const [d, t] = String(a.start).split('T');
    const [y, mo, da] = d.split('-').map(Number);
    const [h, mi] = (t || '00:00').split(':').map(Number);
    return new Date(y, mo - 1, da, h, mi);
};
export const endOf = (a) => new Date(startOf(a).getTime() + (a.dur || 30) * 60000);
export const minutesOf = (a) => {
    const d = startOf(a);
    return d.getHours() * 60 + d.getMinutes();
};
export const fmtTime = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
export const isActive = (a) => a.stato !== 'annullato';
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const mondayOf = (d) => addDays(d, -((d.getDay() + 6) % 7));
export const sameDay = (a, b) => dateKey(a) === dateKey(b);

const num = (v) => {
    const n = parseInt(String(v ?? '').replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
};

// ---- orari di studio: "Lun-Ven: 9:00 - 18:00; Sab 9-12 / 15-18" → { 0..6: [[inizio, fine] in minuti] } ----
const DAYIDX = { lun: 1, mar: 2, mer: 3, gio: 4, ven: 5, sab: 6, dom: 0 };
const ORDER = [1, 2, 3, 4, 5, 6, 0];
export const DEFAULT_HOURS = { 0: [], 1: [[540, 1080]], 2: [[540, 1080]], 3: [[540, 1080]], 4: [[540, 1080]], 5: [[540, 1080]], 6: [] };

export const parseOrari = (text) => {
    const hours = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    let any = false;
    String(text || '')
        .split(/[\n;]+/)
        .forEach((seg) => {
            const times = [...seg.matchAll(/(\d{1,2})(?:[:.](\d{2}))?\s*(?:-|–|—|\balle\b|\ba\b)\s*(\d{1,2})(?:[:.](\d{2}))?/gi)];
            if (!times.length) return;
            // giorni nella parte prima del primo numero: "Lun-Ven", "Martedì e giovedì", "Sab"
            const prefix = seg.slice(0, seg.search(/\d/));
            const toks = [...prefix.matchAll(/\b(lun|mar|mer|gio|ven|sab|dom)[a-zì]*\.?\s*(-|–|—|\ba\b|\bal\b)?/gi)];
            let days = [];
            for (let i = 0; i < toks.length; i++) {
                const a = ORDER.indexOf(DAYIDX[toks[i][1].toLowerCase()]);
                if (toks[i][2] && toks[i + 1]) {
                    const b = ORDER.indexOf(DAYIDX[toks[i + 1][1].toLowerCase()]);
                    for (let k = a; ; k = (k + 1) % 7) {
                        days.push(ORDER[k]);
                        if (k === b) break;
                    }
                    i++;
                } else days.push(ORDER[a]);
            }
            if (!days.length) days = [1, 2, 3, 4, 5];
            times.forEach((t) => {
                const s = Number(t[1]) * 60 + Number(t[2] || 0);
                const e = Number(t[3]) * 60 + Number(t[4] || 0);
                if (Number(t[1]) > 24 || Number(t[3]) > 24 || e <= s) return;
                days.forEach((d) => hours[d].push([s, e]));
                any = true;
            });
        });
    return any ? { hours, isDefault: false } : { hours: DEFAULT_HOURS, isDefault: true };
};

export const agendaSettings = (u = {}) => {
    const { hours, isDefault } = parseOrari(u.orari_studio);
    const places = [u.indirizzo_studio, ...String(u.sedi_multiple || '').split(/[\n;]+/)].map((s) => String(s || '').trim()).filter(Boolean);
    return {
        durFirst: num(u.durata_prima_visita) || 60,
        durCheck: num(u.durata_controllo) || 30,
        hours,
        hoursDefault: isDefault,
        hoursText: String(u.orari_studio || '').trim(),
        policy: String(u.policy_cancellazione || '').trim(),
        places,
        fee: String(u.lettera_compenso || '').trim(),
    };
};

export const defaultDur = (tipo, s) => (tipo === 'prima' ? s.durFirst : tipo === 'controllo' ? s.durCheck : 30);

// finestra oraria da mostrare nella timeline (orari di studio ± 1 ora, e comunque ciò che c'è in agenda)
export const timelineBounds = (settings, appts = []) => {
    let lo = 24 * 60;
    let hi = 0;
    Object.values(settings.hours).forEach((rs) =>
        rs.forEach(([s, e]) => {
            lo = Math.min(lo, s);
            hi = Math.max(hi, e);
        })
    );
    if (hi === 0) {
        lo = 8 * 60;
        hi = 19 * 60;
    }
    appts.forEach((a) => {
        lo = Math.min(lo, minutesOf(a));
        hi = Math.max(hi, minutesOf(a) + (a.dur || 30));
    });
    return { start: Math.max(0, Math.floor((lo - 60) / 60)) * 60, end: Math.min(24 * 60, Math.ceil((hi + 60) / 60) * 60) };
};

// appuntamenti attivi che si sovrappongono a uno nuovo/modificato
export const conflictsWith = (items, cand, ignoreId) => {
    const s = startOf(cand).getTime();
    const e = s + (cand.dur || 30) * 60000;
    return items.filter((a) => a.id !== ignoreId && isActive(a) && startOf(a).getTime() < e && endOf(a).getTime() > s);
};
export const outsideHours = (settings, cand) => {
    const d = startOf(cand);
    const s = d.getHours() * 60 + d.getMinutes();
    const e = s + (cand.dur || 30);
    return !(settings.hours[d.getDay()] || []).some(([a, b]) => s >= a && e <= b);
};

// affianca gli appuntamenti che si sovrappongono nella stessa giornata
export const layoutLanes = (list) => {
    const sorted = [...list].sort((a, b) => startOf(a) - startOf(b));
    const lanes = [];
    const out = sorted.map((a) => {
        let lane = lanes.findIndex((end) => end <= startOf(a).getTime());
        if (lane < 0) lane = lanes.length;
        lanes[lane] = endOf(a).getTime();
        return { a, lane };
    });
    return out.map((o) => ({ ...o, lanes: Math.max(1, lanes.length) }));
};

export const patientName = (db, pid) => {
    const p = ((db && db.pazienti) || []).find((x) => x.id === pid);
    return p ? `${p.nome} ${p.cognome}` : '';
};
export const apptTitle = (db, a) => patientName(db, a.pid) || a.titolo || tipoOf(a.tipo).label;

export const birthdaysOn = (db, date) =>
    ((db && db.pazienti) || [])
        .map((p) => {
            const b = p.dataNascita ? new Date(p.dataNascita) : null;
            if (!b || isNaN(b) || b.getMonth() !== date.getMonth() || b.getDate() !== date.getDate()) return null;
            return { p, age: date.getFullYear() - b.getFullYear() };
        })
        .filter(Boolean);

// ---- export .ics (si importa in Apple Calendar, Google Calendar, Outlook) ----
const icsEsc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\;');
const icsDate = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
export const buildIcs = (db, items, withNames) => {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//URBIOS//Agenda//IT', 'CALSCALE:GREGORIAN'];
    items.filter(isActive).forEach((a) => {
        const name = withNames ? apptTitle(db, a) : tipoOf(a.tipo).label;
        lines.push(
            'BEGIN:VEVENT',
            `UID:${a.id}@urbios`,
            `DTSTAMP:${icsDate(new Date())}`,
            `DTSTART:${icsDate(startOf(a))}`,
            `DTEND:${icsDate(endOf(a))}`,
            `SUMMARY:${icsEsc(withNames ? `${tipoOf(a.tipo).label} · ${name}` : name)}`,
            ...(a.luogo ? [`LOCATION:${icsEsc(a.luogo)}`] : []),
            ...(withNames && a.note ? [`DESCRIPTION:${icsEsc(a.note)}`] : []),
            'END:VEVENT'
        );
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
};

export const newApptId = () => 'a' + Math.random().toString(36).slice(2, 9);

// ---- sede: ogni luogo ha il suo colore e la sua sigla; l'online ha il suo (viola, con la videocamera) ----
// stessa famiglia dei colori dell'app (accent, ok, warn) piu' due toni di appoggio: tutti con la stessa luminosita'
export const PLACE_COLORS = ['#2F54EB', '#1F8A5B', '#B7791F', '#B0476D', '#2C7F92'];
export const ONLINE_COLOR = '#6A55D8';
export const isOnline = (p) => /online|video|remot|meet|zoom|teams|skype/i.test(String(p || ''));
export const placeColor = (places, p) => {
    if (isOnline(p)) return ONLINE_COLOR;
    const i = places.indexOf(String(p || '').trim());
    if (i >= 0) return PLACE_COLORS[i % PLACE_COLORS.length];
    // luogo scritto a mano (non nell'elenco delle sedi): colore stabile ricavato dal nome
    let h = 0;
    for (const ch of String(p || '').trim().toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return String(p || '').trim() ? PLACE_COLORS[h % PLACE_COLORS.length] : '#6E6D69';
};
export const placeMark = (p) => {
    const w = String(p || '').replace(/^(studio|ambulatorio|sede|centro|poliambulatorio)\s+/i, '').trim().split(/[\s,.-]+/).filter(Boolean);
    return ((w[0] || '?')[0] + (w[1] ? w[1][0] : (w[0] || '')[1] || '')).toUpperCase();
};
