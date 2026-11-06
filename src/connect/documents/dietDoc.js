// Dieta di URBIOS → corpo del documento da inviare. PURO. Si inviano SOLO alimenti, grammi, kcal e macro del piano:
// mai anagrafica, misure, diagnosi o note cliniche (calcData non viene letto).
const int = (x) => { const n = Math.round(parseFloat(x)); return Number.isFinite(n) && n >= 0 ? n : 0; };
const txt = (x, max = 120) => String(x ?? '').trim().slice(0, max);

export const dietToDocument = ({ days, targets }) => {
    const giorni = (days || []).map((d, i) => ({
        titolo: txt(d.title) || `Giorno ${i + 1}`,
        pasti: (d.meals || []).map((m) => ({
            nome: txt(m.title),
            voci: (m.items || []).filter((it) => txt(it.name)).map((it) => ({ n: txt(it.name), g: int(it.weight), kcal: int((parseFloat(it.kcal) || 0) * (parseFloat(it.weight) || 0) / 100) })),
        })).filter((m) => m.voci.length),
    })).filter((d) => d.pasti.length);
    if (!giorni.length) throw new Error('La dieta è vuota: aggiungi almeno un alimento.');
    const body = { giorni };
    if (targets?.isConfigured) body.obiettivo = { kcal: int(targets.kcal), p: int(targets.p), c: int(targets.c), f: int(targets.f) };
    return { kind: 'diet', title: 'Piano alimentare', body };
};
