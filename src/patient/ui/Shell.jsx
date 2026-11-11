import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './bits.jsx';
import { UrbiosLogo } from '../../brand/UrbiosLogo.jsx';
import { Home } from './Home.jsx';
import { Schede } from './Schede.jsx';
import { TrainDetail } from './TrainDetail.jsx';
import { Live } from './Live.jsx';
import { Nutrition } from './Nutrition.jsx';
import { MealSheet, ExtraSheet, WeightSheet } from './MealSheet.jsx';
import { VisitSheet, NotesSheet, ShopSheet } from './Tools.jsx';
import { Settings } from './Settings.jsx';
import { nextMeal } from './logic.js';

const TABS = [['home', 'Home', 'home'], ['diet', 'Dieta', 'apple'], ['train', 'Schede', 'dumbbell'], ['me', 'Profilo', 'user']];

// Dock: la capsula attiva scorre da una tab all'altra (posizione misurata sui pulsanti) e cambia colore con la tab
const Dock = ({ tab, tabs, go }) => {
    const refs = useRef([]), [cap, setCap] = useState(null), i = tabs.findIndex(([k]) => k === tab);
    useLayoutEffect(() => { const b = refs.current[i]; if (b) setCap(b.offsetLeft + b.offsetWidth / 2 - 24); }, [tab, tabs.length]);
    return (
        <nav className={'pt-dock' + (tab === 'home' || tab === 'me' ? ' is-glass' : '')} data-tab={tab} aria-label="Navigazione">
            <i className="pt-dock-t" style={cap == null ? { display: 'none' } : { translate: cap + 'px 0' }} />
            {tabs.map(([k, l, ic], n) => <button key={k} ref={(el) => { refs.current[n] = el; }} type="button" aria-label={l} aria-current={tab === k ? 'page' : undefined} className={tab === k ? 'is-on' : ''} onClick={() => go(k)}><Icon name={ic} size={22} /></button>)}
        </nav>
    );
};

// Struttura dell'app paziente: 4 tab con dock a capsula, dettaglio scheda, allenamento guidato, dieta e registro pasto.
export const Shell = ({ rt, onRefresh, onReconnect, onLock, onForget, initial, onWhere }) => {
    // dopo il blocco si rientra nell'allenamento (se lasciato da meno di 30 minuti e il piano esiste ancora)
    const [tab, setTab] = useState('home'), [sub, setSub] = useState(() => (initial && initial.name === 'live' && Date.now() - initial.at < 30 * 60000 && rt.docs.get(initial.id) ? initial : null)), [sheet, setSheet] = useState(null);
    // «Inizia»: schermata viola a tutto schermo con il saluto, poi parte l'allenamento
    const [hi, setHi] = useState(false);
    useEffect(() => { if (!hi) return undefined; const t = setTimeout(() => setHi(false), 1700); return () => clearTimeout(t); }, [hi]);
    const go = (t) => { setTab(t); setSub(null); };
    const nav = (n) => { if (n.name === 'diet') { setTab('diet'); setSub({ name: 'diet', id: n.id }); } else setSub(n); };
    // il puntatore sta solo in memoria (useRef in App): mai salvato; niente pulizia, così sopravvive al blocco
    useEffect(() => { if (onWhere) onWhere(sub && sub.name === 'live' ? { name: 'live', id: sub.id, w: sub.w, d: sub.d, at: Date.now() } : null); }, [sub]);
    if (sub && sub.name === 'live' && hi) return <div className="pt-hi" role="status"><UrbiosLogo size={84} /><b>Buon allenamento</b></div>;
    if (sub && sub.name === 'live') return <Live rt={rt} id={sub.id} w={sub.w} d={sub.d} onExit={(done) => { setSub(null); if (done) setTab('home'); }} />;
    const docs = rt.docs.list();
    const tabs = TABS.filter(([k]) => !docs.length || (k === 'diet' ? docs.some((d) => d.kind === 'diet') : k === 'train' ? docs.some((d) => d.kind === 'training') : true));
    const act = (k) => {
        if (k === 'weight') setSheet({ kind: 'weight' });
        else if (k === 'extra') setSheet({ kind: 'extra' });
        else if (k === 'visit' || k === 'notes' || k === 'shop') setSheet({ kind: k });
        else if (k === 'eat') { const m = nextMeal(docs, rt.docs.get, rt.log.get()); setTab('diet'); setSub(m ? { name: 'diet', id: m.docId } : null); if (m) setSheet({ kind: 'meal', ...m }); }
    };
    let body;
    if (sub && sub.name === 'train') body = <TrainDetail rt={rt} id={sub.id} w0={sub.w} d0={sub.d} onBack={() => setSub(null)} onStart={(s) => { setHi(true); setSub({ name: 'live', ...s }); }} />;
    else if (tab === 'home') body = <Home rt={rt} onNav={nav} onAct={act} onReconnect={onReconnect} />;
    else if (tab === 'train') body = <Schede rt={rt} docs={docs} onOpen={nav} />;
    else if (tab === 'diet') body = <Nutrition rt={rt} id={sub && sub.id} onMeal={(s) => setSheet({ kind: 'meal', ...s })} onExtra={(s) => setSheet({ kind: 'extra', ...s })} />;
    else body = <Settings rt={rt} onAct={act} onBack={() => go('home')} onLock={onLock} onForget={onForget} onRefresh={onRefresh} />;
    return (
        <>
            <div key={tab + '|' + (sub ? sub.name : '')} className={'pt-main pt-enter' + (tab === 'home' && !sub ? ' is-fit' : '')}>{body}</div>
            {!(sub && sub.name === 'train') && (
                <Dock tab={tab} tabs={tabs} go={go} />
            )}
            {sheet && sheet.kind === 'meal' && <MealSheet rt={rt} docId={sheet.docId} d={sheet.d} m={sheet.m} date={sheet.date} onClose={() => setSheet(null)} />}
            {sheet && sheet.kind === 'weight' && <WeightSheet rt={rt} onClose={() => setSheet(null)} />}
            {sheet && sheet.kind === 'visit' && <VisitSheet rt={rt} onClose={() => setSheet(null)} />}
            {sheet && sheet.kind === 'notes' && <NotesSheet rt={rt} onClose={() => setSheet(null)} />}
            {sheet && sheet.kind === 'shop' && <ShopSheet rt={rt} docs={docs} onClose={() => setSheet(null)} />}
            {sheet && sheet.kind === 'extra' && <ExtraSheet rt={rt} names={sheet.names} date={sheet.date} onClose={() => setSheet(null)} />}
        </>
    );
};
