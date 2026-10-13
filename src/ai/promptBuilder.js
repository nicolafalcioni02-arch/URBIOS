// URBIOS AI — costruisce il prompt da incollare nell'agente AI scelto dal professionista.
// Il formato di risposta è fisso (vedi responseParser.js): l'AI deve restituire UN solo blocco JSON.
import { PATIENT_FIELDS, getVisitFields } from './fieldRegistry';
import { dietContext, dietPromptBlock, dietTemplate } from './dietSection';
import { trainingContext, trainingPromptBlock, trainingTemplate } from './trainingSection';

export const FORMAT_NAME = 'URBIOS-AI';
export const FORMAT_VERSION = 1;

export const newRequestId = () => 'UAI-' + Math.random().toString(36).slice(2, 7).toUpperCase();

const ageOf = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d)) return null;
    const t = new Date();
    let a = t.getFullYear() - d.getFullYear();
    if (t.getMonth() < d.getMonth() || (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())) a--;
    return a;
};

const describe = (f) => {
    let t = f.type === 'number' ? 'numero' : f.type === 'date' ? 'data AAAA-MM-GG' : f.type === 'enum' ? `uno tra: ${f.options.join(' | ')}` : 'testo';
    if (f.unit) t += ` (${f.unit})`;
    return `  - "${f.key}": ${t} — ${f.label}${f.hint ? `, ${f.hint}` : ''}`;
};

const block = (title, fields) => {
    const groups = [...new Set(fields.map((f) => f.group))];
    return `${title}\n` + groups.map((g) => `# ${g}\n` + fields.filter((f) => f.group === g).map(describe).join('\n')).join('\n');
};

const knownLines = (patient, visitDraft, fields) => {
    const out = [];
    for (const f of fields) {
        const v = f.scope === 'anagrafica' ? patient[f.key] : visitDraft[f.key];
        if (v !== undefined && v !== null && String(v).trim() !== '') out.push(`- ${f.label}: ${v}${f.unit ? ' ' + f.unit : ''}`);
    }
    return out.length ? out.join('\n') : '(nessun dato già presente)';
};

export const buildPrompt = ({ patient, visitDraft, db, answers, questions, sections, requestId, foodDB, dietOpts, exerciseDB, trainingOpts }) => {
    const wantT = sections.includes('training');
    const wantD = sections.includes('dieta');
    const wantA = sections.includes('anagrafica');
    const wantV = sections.includes('visita');
    const visitFields = getVisitFields(db?.rangeEmato);

    const age = ageOf(patient.dataNascita);
    const sex = (patient.sesso || '').toUpperCase() === 'F' ? 'femmina' : 'maschio';

    const interview = questions
        .filter((q) => (answers[q.id] || '').trim())
        .map((q) => `D: ${q.q}\nR: ${answers[q.id].trim()}`)
        .join('\n\n');

    const known = [
        wantA ? 'ANAGRAFICA già nota:\n' + knownLines(patient, visitDraft, PATIENT_FIELDS.map((f) => ({ ...f, scope: 'anagrafica' }))) : '',
        wantV ? 'VISITA già misurata/inserita:\n' + knownLines(patient, visitDraft, visitFields.map((f) => ({ ...f, scope: 'visita' }))) : '',
    ]
        .filter(Boolean)
        .join('\n\n');

    const schema = [wantA && block('SEZIONE "anagrafica" (campi consentiti):', PATIENT_FIELDS), wantV && block('SEZIONE "visita" (campi consentiti):', visitFields)]
        .filter(Boolean)
        .join('\n\n');
    const dietBlock = wantD ? dietPromptBlock({ ctx: dietOpts.ctx || dietContext(patient, visitDraft), foodDB, opts: dietOpts }) : '';

    const trainingBlock = wantT ? trainingPromptBlock({ ctx: trainingContext(patient), exerciseDB, opts: trainingOpts }) : '';

    const template = {
        format: FORMAT_NAME,
        version: FORMAT_VERSION,
        richiesta: requestId,
        paziente_id: String(patient.id),
        ...(wantA && { anagrafica: { '<chiave>': '<valore>' } }),
        ...(wantV && { visita: { '<chiave>': '<valore>' } }),
        ...(wantD && { dieta: dietTemplate(dietOpts) }),
        ...(wantT && { allenamento: trainingTemplate() }),
        avvisi: ['<eventuali dubbi o dati mancanti importanti per il professionista>'],
    };

    return `Sei l'assistente clinico di un professionista della nutrizione e delle scienze motorie che usa il software URBIOS.
Il professionista ha appena fatto una visita. Il tuo compito è trasformare le informazioni qui sotto in dati strutturati da importare in URBIOS.

REGOLE (importanti):
1. Rispondi con UN SOLO blocco di codice JSON (\`\`\`json ... \`\`\`), senza testo prima o dopo e senza commenti nel JSON.
2. Usa SOLO le chiavi elencate in "campi consentiti". Non inventare chiavi nuove.
3. NON inventare dati. Se un'informazione non c'è, ometti la chiave. Meglio un campo vuoto che uno sbagliato.
4. I numeri sono numeri puri con il punto decimale (es. 72.5), senza unità di misura. Le unità sono indicate accanto a ogni campo.
5. I campi di testo vanno scritti in italiano, in forma sintetica e professionale, riassumendo ciò che è emerso (non copiare la domanda).
6. Per i campi "uno tra", usa esattamente uno dei valori elencati.
7. Esami del sangue: se il professionista ha incollato referti, associa ogni valore alla chiave corretta convertendo, se serve, nell'unità indicata. Valori che non riconosci con certezza vanno in "avvisi".
8. In "avvisi" segnala incongruenze, dati critici mancanti o elementi che il professionista dovrebbe verificare.
9. Copia esattamente i campi "richiesta" e "paziente_id" nel JSON.

PAZIENTE: ${patient.nome} ${patient.cognome}, ${sex}${age !== null ? `, ${age} anni` : ''}.

${known}

INTERVISTA SVOLTA CON IL PAZIENTE:
${interview || '(nessuna risposta fornita)'}

${schema}
${dietBlock}${trainingBlock}
FORMATO DELLA RISPOSTA (rispetta esattamente questa struttura):
\`\`\`json
${JSON.stringify(template, null, 2)}
\`\`\`
`;
};
