import { findArticle } from './WhereSheet';

// Condizione di un materiale: in ghiaccio (fondo blu) o pericoloso (fondo giallo). `cond` scelto a mano ('ice' | 'hazard' | 'none'),
// altrimenti si capisce dal magazzino (campo Pericolo, o conservazione «ghiaccio»).
export const COND = { ice: { label: 'Tieni in ghiaccio', icon: 'ice' }, hazard: { label: 'Pericoloso', icon: 'skull' } };
// valori accettati: ice | hazard | none (anche «Ghiaccio», «Pericolo», «Nessuna» scritti dal magazzino o dall'AI)
export const normCond = (v) => { const x = String(v || '').trim().toLowerCase(); if (/^(ice|ghiacc)/.test(x)) return 'ice'; if (/^(hazard|pericol|tossic)/.test(x)) return 'hazard'; if (/^(none|nessun)/.test(x)) return 'none'; return ''; };
export const condOf = (m, lab) => {
    const mc = normCond(m.cond);
    if (mc === 'none') return '';
    if (mc) return mc;
    if (String(m.pericolo || '').trim() && !/^(nessun|no|-)/i.test(String(m.pericolo).trim())) return 'hazard';
    const a = findArticle(lab, m);
    if (!a) return '';
    const ac = normCond(a.cond);
    if (ac === 'none') return '';
    if (ac) return ac;
    if (String(a.pericolo || '').trim() && !/^(nessun|no|-)/i.test(String(a.pericolo).trim())) return 'hazard';
    if (/ghiacc|\bice\b/i.test(`${a.conservazione || ''} ${m.note || ''}`)) return 'ice';
    return '';
};
