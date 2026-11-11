import React, { useState } from 'react';
import { UrbiosLogo } from '../../brand/UrbiosLogo.jsx';
import { Icon, Note } from './bits.jsx';
import { daysTo, shopItems } from './Tools.jsx';
import { Clamp } from './Clamp.jsx';
import { arr, estMinutes, lastWeight, fmtKg, dayStatus, nextMeal, toolsOf, dietDayToday, mealKey, ymd } from './logic.js';


// Segno del logo: decorazione grande, ruota lentissimo; al tocco fa uno scatto di 45°
const Mark = () => {
    const [kick, setKick] = useState(0);
    return <div className="hm2-mark" aria-hidden="true" onPointerDown={() => setKick((k) => k + 1)}><div className="hm2-mark-k" style={{ rotate: kick * 45 + 'deg' }}><UrbiosLogo size={440} /></div></div>;
};
const dayTag = (() => { const d = new Date(); return d.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '').toUpperCase() + ' ' + d.getDate(); });

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
    const w = lastWeight(log), tools = toolsOf(log), dv = daysTo(tools.visit), notes = arr(tools.notes).length;
    const meal = nextMeal(docs, rt.docs.get, log), hasDiet = docs.some((d) => d.kind === 'diet');
    const mealDoc = meal && rt.docs.get(meal.docId), mealName = meal && mealDoc && mealDoc.body && arr(arr(mealDoc.body.giorni)[meal.d] && arr(mealDoc.body.giorni)[meal.d].pasti)[meal.m] ? arr(arr(mealDoc.body.giorni)[meal.d].pasti)[meal.m].nome : null;
    // pasti registrati oggi / pasti del giorno (stesso calcolo degli anelli di Progress)
    const eatV = (() => { const dt = docs.filter((d) => d.kind === 'diet').map((d) => ({ d, doc: rt.docs.get(d.docId) })).find((x) => x.doc && x.doc.body && arr(x.doc.body.giorni).length); if (!dt) return ''; const gg = arr(dt.doc.body.giorni), di = dietDayToday(log, dt.d.docId, gg, ymd()), pasti = arr(gg[di] && gg[di].pasti); return pasti.length ? `${pasti.filter((_, m) => log.meals[mealKey(dt.d.docId, di, m, ymd())]).length}/${pasti.length}` : ''; })();
    const shopAll = hasDiet ? shopItems(docs, rt.docs.get, tools.cfg.days, tools.cfg.people) : [], shopLeft = shopAll.filter((x) => !tools.shop[x.k]).length;
    // Strumenti: sotto l'icona il dato, se c'è; altrimenti la parola
    const tiles = [
        ...(hasDiet && hero ? [{ k: 'eat', ic: 'fork', q: 'Pasti', v: eatV }] : []),
        { k: 'weight', ic: 'scale', q: 'Peso', v: w ? fmtKg(w.kg) : '' },
        { k: 'visit', ic: 'calendar', q: 'Controllo', v: dv === null || dv < 0 ? '' : dv === 0 ? 'Oggi' : dv === 1 ? '1 g' : dv + ' gg' },
        ...(hasDiet ? [{ k: 'shop', ic: 'cart', q: 'Spesa', v: shopLeft ? String(shopLeft) : '', ok: shopAll.length > 0 && !shopLeft }] : []),
        { k: 'notes', ic: 'note', q: 'Appunti', v: notes ? String(notes) : '' },
    ];
    return (
        <>
            <header className="pt-top" aria-hidden="true" />
            {!st.linked && <Note tone="warn">Il professionista ha chiuso il collegamento: i piani già ricevuti restano qui, ma non arriveranno aggiornamenti.
                <div className="pt-btns"><button type="button" className="pt-btn" onClick={onReconnect}>Collega di nuovo</button></div></Note>}
            {conflicts > 0 && <Note tone="warn">Due versioni dello stesso piano non coincidono. Mostro quella ricevuta per prima: chiedi conferma al professionista.</Note>}
            {docs.length === 0 && <div className="pt-empty">Quando il professionista ti invia un piano comparirà qui.</div>}
            <div className="hm2">
                <div className="hm2-brand"><UrbiosLogo size={22} /><span>URBIOS</span></div>
                <span className="hm2-date">{dayTag()}</span>
                <Mark />
                {hero ? (
                    <div className="hm2-next" role="group" aria-label={(hero.st.state === 'done' ? 'Ultimo allenamento' : hero.st.state === 'part' ? 'Allenamento iniziato' : 'Prossimo allenamento') + ': ' + hero.day.titolo}>
                        <div className="hm2-t"><span className={'hm2-ic ' + (hero.st.state === 'done' ? 'is-ok' : '')}><Icon name={hero.st.state === 'done' ? 'check' : 'dumbbell'} size={20} /></span>
                            <div><Clamp as="b" lines={2} title="Allenamento" text={hero.day.titolo} className={hero.day.titolo.length > 18 ? 'is-long' : ''} /></div></div>
                        {hero.st.state === 'part' && daysTo(hero.st.date) < 0
                            ? <span className="hm2-s">{daysTo(hero.st.date) === -1 ? 'Iniziato ieri · scade domani' : "Iniziato l'altro ieri · scade oggi"}</span>
                            : <div className="hm2-pills"><span className="hm2-pill"><Icon name="dumbbell" size={14} />{arr(hero.day.esercizi).length}</span><span className="hm2-pill"><Icon name="clock" size={14} />{estMinutes(hero.day)}′</span></div>}
                        <button type="button" className="hm2-go" onClick={() => onNav({ name: hero.st.state === 'part' ? 'live' : 'train', id: hero.meta.docId, w: hero.w, d: hero.di })}><Icon name="play" size={18} />{hero.st.state === 'part' ? 'Riprendi' : 'Inizia'}</button>
                    </div>
                ) : hasDiet ? (
                    <div className="hm2-next" role="group" aria-label={(meal ? 'Prossimo pasto' : 'Pasti di oggi') + ': ' + (mealName || 'Tutto registrato')}>
                        <div className="hm2-t"><span className="hm2-ic is-eat"><Icon name="fork" size={20} /></span><div><b>{mealName || 'Tutto registrato'}</b></div></div>
                        <button type="button" className="hm2-go" onClick={() => onAct('eat')}>{meal ? 'Registra' : 'Apri la dieta'}<Icon name="chev" size={18} /></button>
                    </div>
                ) : null}
                <nav className="hm2-q" aria-label="Azioni rapide">
                    {tiles.map((x) => <button key={x.k} type="button" aria-label={x.q + (x.v ? ' ' + x.v : '')} onClick={() => onAct(x.k)}><i><Icon name={x.ic} size={22} /></i>{x.v ? <b>{x.v}</b> : x.ok ? <Icon name="check" size={14} /> : <span>{x.q}</span>}</button>)}
                </nav>
            </div>
        </>
    );
};
