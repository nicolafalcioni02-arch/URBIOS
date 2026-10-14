// URBIOS AI — RICETTE: prompt per far scrivere una ricetta all'AI e lettura della risposta.
// Come per i menù, l'AI scrive nomi e grammi degli ingredienti: kcal e macro arrivano dal database alimenti.
import { matchFood } from './foodMatcher';
import { foodListText } from './dietSection';
import { redactText } from './promptBuilder';

const num = (v) => {
    const x = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(x) ? x : null;
};
const list = (v) => (Array.isArray(v) ? v.join(', ') : v ? String(v) : '');

export const buildRecipePrompt = ({ patient, foodDB, requestId, title, servings, notes, includeFoodList }) => {
    const allergy = redactText(list(patient?.allergie), patient);
    const diseases = redactText(list(patient?.patologie), patient);
    const template = {
        format: 'URBIOS-AI',
        version: 1,
        richiesta: requestId,
        paziente_id: String(patient?.id ?? ''),
        ricetta: {
            nome: '<nome della ricetta>',
            porzioni: servings || 8,
            peso_finale_g: null,
            ingredienti: [{ nome: '<ingrediente>', grammi: 0 }],
            procedimento: ['<passaggio>'],
            note: '',
        },
        avvisi: [],
    };
    return `Sei l'assistente di un nutrizionista che usa il software URBIOS. Devi scrivere UNA ricetta, in forma strutturata, da importare in URBIOS.

REGOLE:
1. Rispondi con UN SOLO blocco di codice JSON (\`\`\`json ... \`\`\`), senza testo prima o dopo e senza commenti.
2. "ingredienti": quantità in grammi per l'INTERA ricetta (non per porzione). Per liquidi e uova converti in grammi (1 uovo medio = 60 g; 1 ml latte ≈ 1 g; 1 cucchiaio olio ≈ 10 g).
3. "porzioni": quante porzioni ottieni. "peso_finale_g": peso della preparazione cotta, solo se lo sai con ragionevole sicurezza (altrimenti ometti la chiave).
4. NON scrivere kcal né macro: li calcola URBIOS. Se un ingrediente NON può essere nel database (prodotto molto particolare) puoi aggiungere "valori_100g": {"kcal":..,"p":..,"c":..,"f":..} per 100 g; altrimenti omettili.
5. Usa ingredienti semplici e comuni, nomi italiani generici (es. "Farina di frumento tipo 00", "Zucchero", "Uova di gallina", "Latte di vacca intero", "Olio di semi di girasole"), senza marche.
6. "procedimento": passaggi brevi e numerati nell'ordine; includi temperatura e tempi di cottura.
7. Rispetta ALLERGIE e INTOLLERANZE e le richieste qui sotto. Se una richiesta è incompatibile con la ricetta, scegli la variante più sicura e segnalalo in "avvisi".
8. Copia esattamente "richiesta" e "paziente_id".

RICETTA RICHIESTA: ${redactText(title, patient) || '(a scelta, adatta al paziente)'}
${servings ? `Porzioni desiderate: ${servings}\n` : ''}${notes ? `Richieste del professionista: ${redactText(notes, patient)}\n` : ''}${allergy ? `Allergie/intolleranze: ${allergy}\n` : ''}${diseases ? `Patologie: ${diseases}\n` : ''}
${includeFoodList ? `DATABASE ALIMENTI DI URBIOS (usa PREFERIBILMENTE questi nomi, identici, per gli ingredienti):\n${foodListText(foodDB)}\n` : ''}
FORMATO DELLA RISPOSTA:
\`\`\`json
${JSON.stringify(template, null, 2)}
\`\`\`
`;
};

export const parseRecipe = (raw, { foodIndex }) => {
    const out = { ok: false, warnings: [], title: '', servings: 1, finalWeight: null, ingredients: [], steps: [], note: '' };
    if (!raw || typeof raw !== 'object') return out;
    out.title = String(raw.nome || raw.titolo || '').trim();
    out.servings = Math.max(1, Math.round(num(raw.porzioni) ?? 1));
    const fw = num(raw.peso_finale_g);
    if (fw && fw > 0) out.finalWeight = Math.round(fw);
    out.ingredients = (Array.isArray(raw.ingredienti) ? raw.ingredienti : [])
        .map((it, i) => {
            const name = String(it?.nome || it?.name || '').trim();
            const grams = num(it?.grammi ?? it?.g);
            if (!name || name.startsWith('<') || grams === null || grams <= 0) return null;
            const v = it.valori_100g || null;
            const aiValues = v && num(v.kcal) !== null ? { kcal: num(v.kcal) || 0, p: num(v.p) || 0, c: num(v.c) || 0, f: num(v.f) || 0 } : null;
            return { key: `r${i}`, aiName: name, grams: Math.round(grams * 10) / 10, match: matchFood(name, foodIndex), aiValues };
        })
        .filter(Boolean);
    out.steps = (Array.isArray(raw.procedimento) ? raw.procedimento : typeof raw.procedimento === 'string' ? raw.procedimento.split(/\n+/) : [])
        .map((s) => String(s).replace(/^\s*\d+[.)]\s*/, '').trim())
        .filter((s) => s && !s.startsWith('<'));
    out.note = String(raw.note || '').trim();
    if (!out.ingredients.length) out.warnings.push('La ricetta non contiene ingredienti validi.');
    out.ok = out.ingredients.length > 0;
    return out;
};
