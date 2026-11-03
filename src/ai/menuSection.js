// URBIOS AI — MENÙ: prompt per far comporre all'AI un menù per un evento (piatti scelti dal ricettario, special, lettera agli chef)
// e lettura della risposta. L'AI non vede nessun dato di pazienti: solo l'evento e i nomi delle ricette.
const list = (v) => (Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x : `${x.name}${x.n ? ` (${x.n} ${Number(x.n) === 1 ? 'persona' : 'persone'})` : ''}`)).join(', ') : v ? String(v) : '');

export const buildMenuPrompt = ({ a, recipes, user }) => {
    const template = {
        menu: {
            titolo: '<titolo del menù>',
            sottotitolo: '<es. Menù degustazione, 4 portate>',
            portate: [{ nome: 'Antipasto', piatti: [{ ricetta_id: '<id del ricettario, oppure null>', nome: '<nome del piatto>' }] }],
        },
        special: [{ nome: 'Senza glutine', persone: 0, sostituzioni: [{ da: '<ingrediente>', a: '<ingrediente sostitutivo>' }], attenzioni: '<contaminazioni e cautele>' }],
        lettera: '<lettera agli chef, paragrafi separati da una riga vuota>',
    };
    const me = [user?.nome, user?.cognome].filter(Boolean).join(' ') || '[Nome Cognome]';
    const role = user?.titolo_professionale ? `, ${String(user.titolo_professionale).toLowerCase()},` : '';
    const byId = Object.fromEntries(recipes.map((r) => [r.id, r]));
    const lib = recipes.map((r) => `- ${r.id}: ${r.title}${r.category ? ` (${r.category})` : ''}`).join('\n');
    return `Sei l'assistente di un nutrizionista che organizza il menù di un evento e lo passa agli chef di una cucina. Devi comporre il menù e scrivere la lettera per gli chef.

REGOLE:
1. Rispondi con UN SOLO blocco di codice JSON (\`\`\`json ... \`\`\`), senza testo prima o dopo.
2. Per ogni piatto usa PREFERIBILMENTE una ricetta del RICETTARIO qui sotto (copia "ricetta_id" identico). Se serve un piatto che non c'è, metti "ricetta_id": null e un nome chiaro.
3. Usa SOLO le portate richieste, con il numero di piatti per portata indicato; i piatti già scelti restano, compila solo i posti liberi.
4. "special": un elemento per ogni esigenza indicata, comprese le combinazioni (es. celiaco + senza lattosio = un solo special con entrambe le cautele), con "persone" = il numero indicato (allergie, intolleranze, scelte di dieta), con le sostituzioni degli ingredienti piatto per piatto ("da" → "a") e le attenzioni in cucina (contaminazione crociata, utensili e superfici dedicate, tracce, etichettatura del piatto). Se non ci sono esigenze, "special": [].
5. "lettera": scritta come una lettera dal professionista agli chef, in italiano, tono professionale e cordiale, 5-7 paragrafi: apertura con una frase di presentazione, tipo: "Sono ${me}${role} e ${a.event || '[nome del cliente]'} mi hanno contattato per ideare e bilanciare il menù per la loro giornata speciale" (usa esattamente questi dati del professionista, senza inventare altro); poi l'idea del menù; come sono pensati i piatti; HACCP (aprilo con una battuta autoironica e scherzosa, mai da maestrino: ad esempio che sai bene che in cucina ne sanno più di te e che ti hanno parlato benissimo di loro, ma da biologo non resisti e ti tocca fare il ripasso, promettendo di essere breve e di offrire un caffè; tono da collega simpatico, non da chi dà lezioni; poi controllo temperature, tracciabilità, date di scadenza, igiene del personale); catena del freddo (abbattimento, conservazione a +4 °C, rigenerazione e mantenimento del caldo sopra i +65 °C, tempi massimi); contaminazioni da evitare (crociate, allergeni, crudo/cotto); servizio degli special. Se ci sono special, per ciascuna condizione (es. celiachia, allergia, intolleranza) aggiungi una breve descrizione chiara della patologia: cosa rischia l'ospite se ci sono tracce o contaminazioni (reazioni e gravità), cosa può mangiare e cosa no, così la cucina è preparata. Niente saluti con il nome del professionista: firma lui.

EVENTO
Nome: ${a.event || '(non indicato)'}
Tipo: ${a.kind || '(non indicato)'}
Ospiti: ${a.guests || '(non indicato)'}
Stile e cucina: ${a.style || '(a scelta)'}
Portate richieste:
${a.courses.map((c) => {
        const picks = (c.picks || []).map((id) => byId[id]).filter(Boolean);
        const free = Math.max(0, c.n - picks.length);
        return `- ${c.name}: ${c.n} ${c.n === 1 ? 'piatto' : 'piatti'}${picks.length ? `; GIÀ SCELTI dal professionista (inseriscili tali e quali con il loro ricetta_id): ${picks.map((r) => `${r.id} = ${r.title}`).join('; ')}` : ''}${free ? `; scegli tu gli altri ${free} dal ricettario, coerenti con i piatti già scelti` : '; nessun piatto da aggiungere'}`;
    }).join('\n')}
Esigenze alimentari tra gli ospiti: ${list(a.needs) || 'nessuna'}${a.needsNote ? `\nDettagli sulle esigenze: ${a.needsNote}` : ''}${a.notes ? `\nRichieste del professionista: ${a.notes}` : ''}

RICETTARIO:
${lib || '(vuoto: usa ricetta_id null)'}

FORMATO DELLA RISPOSTA:
\`\`\`json
${JSON.stringify(template, null, 2)}
\`\`\`
`;
};

export const parseMenu = (raw, recipes) => {
    const m = String(raw).match(/```(?:json)?\s*([\s\S]*?)```/i);
    let txt = m ? m[1] : String(raw);
    const i = txt.indexOf('{');
    const j = txt.lastIndexOf('}');
    if (i < 0 || j < i) return { ok: false, error: 'Non trovo il JSON nella risposta. Rigenera con il prompt.' };
    let d;
    try {
        d = JSON.parse(txt.slice(i, j + 1));
    } catch {
        return { ok: false, error: 'Il JSON non è valido. Chiedi all’AI di rispondere solo con il blocco di codice.' };
    }
    const mm = d.menu;
    if (!mm || !Array.isArray(mm.portate)) return { ok: false, error: 'Nella risposta manca il menù (chiave "menu" con "portate").' };
    const byId = Object.fromEntries(recipes.map((r) => [r.id, r]));
    const byName = Object.fromEntries(recipes.map((r) => [r.title.trim().toLowerCase(), r]));
    const missing = [];
    const portate = mm.portate.map((p) => ({
        name: String(p.nome || 'Portata'),
        dishes: (p.piatti || []).map((x) => {
            const r = byId[x.ricetta_id] || byName[String(x.nome || '').trim().toLowerCase()];
            if (!r) missing.push(String(x.nome || '?'));
            return { rid: r ? r.id : '', name: r ? r.title : String(x.nome || ''), ok: Boolean(r) };
        }),
    }));
    return {
        ok: true,
        title: String(mm.titolo || ''),
        subtitle: String(mm.sottotitolo || ''),
        portate,
        missing,
        specials: (Array.isArray(d.special) ? d.special : []).map((s) => ({
            name: String(s.nome || ''),
            persons: String(s.persone || ''),
            care: String(s.attenzioni || ''),
            subs: (s.sostituzioni || []).map((b) => ({ from: String(b.da || ''), to: String(b.a || '') })),
        })),
        letter: typeof d.lettera === 'string' ? d.lettera : Array.isArray(d.lettera) ? d.lettera.join('\n\n') : '',
    };
};
