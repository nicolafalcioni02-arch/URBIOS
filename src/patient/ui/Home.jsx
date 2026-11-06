import React from 'react';
import { UrbiosLogo } from '../../brand/UrbiosLogo.jsx';
import { Icon, Note } from './bits.jsx';
import { daysTo } from './Tools.jsx';
import { arr, estMinutes, daySets, todayLabel, lastWeight, fmtKg, fmtDay, dayStatus, currentWeek, nextMeal, toolsOf } from './logic.js';


// Elenco delle sessioni (un riquadro per giorno della prima settimana di ogni scheda), usato da Home e dalla tab Schede.
export const Home = ({ rt, onNav, onAct, onReconnect }) => {
    const st = rt.status(), docs = rt.docs.list(), conflicts = rt.docs.conflicts().length, log = rt.log.get();
    // Riquadro principale: il PROSSIMO allenamento da fare (prima uno iniziato, poi il primo non fatto); se è tutto fatto, l'ultimo.
    const hero = (() => {
        let todo = null, part = null, last = null;
        for (const meta of docs.filter((d) => d.kind === 'training')) {
            const doc = rt.docs.get(meta.docId), weeks = arr(doc && doc.body && doc.body.settimane);
            weeks.forEach((wk, w) => arr(wk.giorni).forEach((day, di) => {
                const st = dayStatus(log, meta.docId, w, di, day), h = { meta, day, di, w, st, done: st.done, tot: st.tot };
                if (st.state === 'part' && !part) part = h; else if (st.state === 'todo' && !todo) todo = h; else if (st.state === 'done') last = h;
            }));
        }
        return part || todo || last;
    })();
    const pct = hero ? Math.round(Math.min(1, hero.tot ? hero.done / hero.tot : 0) * 100) : 0, w = lastWeight(log), tools = toolsOf(log), dv = daysTo(tools.visit), notes = arr(tools.notes).length;
    const meal = nextMeal(docs, rt.docs.get, log), hasDiet = docs.some((d) => d.kind === 'diet');
    const mealDoc = meal && rt.docs.get(meal.docId), mealName = meal && mealDoc && mealDoc.body && arr(arr(mealDoc.body.giorni)[meal.d] && arr(mealDoc.body.giorni)[meal.d].pasti)[meal.m] ? arr(arr(mealDoc.body.giorni)[meal.d].pasti)[meal.m].nome : null;
    // Riquadri secondari: la dieta compare solo se il professionista l'ha inviata
    const tiles = [
        ...(hasDiet && hero ? [{ k: 'eat', ic: 'fork', t: 'Cosa mangiamo?', s: meal ? 'Il prossimo pasto' : 'Il tuo piano' }] : []),
        { k: 'weight', ic: 'scale', t: 'Registra il peso', s: w ? fmtKg(w.kg) + ' kg' : 'Non ancora inserito' },
        { k: 'visit', ic: 'calendar', t: 'Prossimo controllo', s: dv === null ? 'Imposta la data' : dv < 0 ? 'Data passata' : dv === 0 ? 'Oggi' : dv === 1 ? 'Domani' : `Tra ${dv} giorni` },
        ...(hasDiet ? [{ k: 'shop', ic: 'cart', t: 'Lista della spesa', s: 'Dalla tua dieta' }] : []),
        { k: 'notes', ic: 'note', t: 'Da dire al professionista', s: notes ? `${notes} appunt${notes === 1 ? 'o' : 'i'}` : 'Scrivi un promemoria' },
    ];
    return (
        <>
            <header className="pt-top">
                <div><span className="pt-hi2">{todayLabel()}</span></div>
                <div className="pt-top-r"><UrbiosLogo size={34} className="pt-top-logo" /></div>
            </header>
            {!st.linked && <Note tone="warn">Il professionista ha chiuso il collegamento: i piani già ricevuti restano qui, ma non arriveranno aggiornamenti.
                <div className="pt-btns"><button type="button" className="pt-btn" onClick={onReconnect}>Collega di nuovo</button></div></Note>}
            {st.lastError && <Note tone="warn">Non riesco a collegarmi per ricevere nuovi piani. Riproverò da solo.</Note>}
            {conflicts > 0 && <Note tone="warn">Due versioni dello stesso piano non coincidono. Mostro quella ricevuta per prima: chiedi conferma al professionista.</Note>}
            {docs.length === 0 && <div className="pt-empty">Quando il professionista ti invia un piano comparirà qui.</div>}
            <div className="pt-hm" style={{ gridTemplateRows: `${hero || hasDiet ? '1.25fr ' : ''}repeat(${Math.ceil(tiles.length / 2)}, 1fr)` }}>
                {hero && (
                    <button type="button" className="pt-hm-w" onClick={() => onNav({ name: 'train', id: hero.meta.docId, w: hero.w, d: hero.di })}>
                        <span className="pt-hm-k">{hero.st.state === 'done' ? 'Ultimo allenamento' : hero.st.state === 'part' ? 'Allenamento iniziato' : 'Prossimo allenamento'}</span>
                        <b>{hero.day.titolo}</b>
                        <span className="pt-hm-s">{arr(hero.day.esercizi).length} esercizi · ~{estMinutes(hero.day)} min</span>
                        <span className="pt-hm-bar"><i style={{ width: pct + '%' }} /></span>
                        <span className="pt-hm-go">{hero.st.state === 'part' ? 'Riprendi' : 'Inizia'} <Icon name="arrow" size={16} /></span>
                    </button>
                )}
                {/* Senza scheda (es. solo dieta) il riquadro grande è quello del prossimo pasto */}
                {!hero && hasDiet && (
                    <button type="button" className="pt-hm-w" onClick={() => onAct('eat')}>
                        <span className="pt-hm-k">{meal ? 'Prossimo pasto' : 'Pasti di oggi'}</span>
                        <b>{mealName || 'Tutto registrato'}</b>
                        <span className="pt-hm-s">{meal ? 'Tocca per registrarlo' : 'Hai registrato tutti i pasti'}</span>
                        <span className="pt-hm-go">{meal ? 'Registra' : 'Apri la dieta'} <Icon name="arrow" size={16} /></span>
                    </button>
                )}
                {tiles.map((x, i) => <button key={x.k} type="button" className={'pt-hm-c' + (tiles.length % 2 && i === tiles.length - 1 ? ' is-wide' : '')} onClick={() => onAct(x.k)}><span className="pt-hm-i"><Icon name={x.ic} size={22} /></span><b>{x.t}</b><small>{x.s}</small></button>)}
            </div>
        </>
    );
};
