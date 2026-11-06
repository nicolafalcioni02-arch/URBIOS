import React, { useState } from 'react';
import { Icon } from './bits.jsx';
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

// Struttura dell'app paziente: 4 tab con dock a capsula, dettaglio scheda, allenamento guidato, dieta e registro pasto.
export const Shell = ({ rt, onRefresh, onReconnect, onLock, onForget }) => {
    const [tab, setTab] = useState('home'), [sub, setSub] = useState(null), [sheet, setSheet] = useState(null);
    const go = (t) => { setTab(t); setSub(null); };
    const nav = (n) => { if (n.name === 'diet') { setTab('diet'); setSub({ name: 'diet', id: n.id }); } else setSub(n); };
    if (sub && sub.name === 'live') return <Live rt={rt} id={sub.id} w={sub.w} d={sub.d} onExit={(done) => { setSub(null); if (done) setTab('home'); }} />;
    const docs = rt.docs.list();
    const act = (k) => {
        if (k === 'weight') setSheet({ kind: 'weight' });
        else if (k === 'extra') setSheet({ kind: 'extra' });
        else if (k === 'visit' || k === 'notes' || k === 'shop') setSheet({ kind: k });
        else if (k === 'eat') { const m = nextMeal(docs, rt.docs.get, rt.log.get()); setTab('diet'); setSub(m ? { name: 'diet', id: m.docId } : null); if (m) setSheet({ kind: 'meal', ...m }); }
    };
    let body;
    if (sub && sub.name === 'train') body = <TrainDetail rt={rt} id={sub.id} w0={sub.w} d0={sub.d} onBack={() => setSub(null)} onStart={(s) => setSub({ name: 'live', ...s })} />;
    else if (tab === 'home') body = <Home rt={rt} onNav={nav} onAct={act} onReconnect={onReconnect} />;
    else if (tab === 'train') body = <Schede rt={rt} docs={docs} onOpen={nav} />;
    else if (tab === 'diet') body = <Nutrition rt={rt} id={sub && sub.id} onMeal={(s) => setSheet({ kind: 'meal', ...s })} onExtra={(s) => setSheet({ kind: 'extra', ...s })} />;
    else body = <Settings rt={rt} onBack={() => go('home')} onLock={onLock} onForget={onForget} onRefresh={onRefresh} />;
    return (
        <>
            <div className={'pt-main' + (tab === 'home' && !sub ? ' is-fit' : '')}>{body}</div>
            {!(sub && sub.name === 'train') && (
                <nav className={'pt-dock' + (tab === 'home' || tab === 'me' ? ' is-glass' : '')} aria-label="Navigazione">
                    {TABS.filter(([k]) => !docs.length || (k === 'diet' ? docs.some((d) => d.kind === 'diet') : k === 'train' ? docs.some((d) => d.kind === 'training') : true)).map(([k, l, ic]) => <button key={k} type="button" aria-label={l} aria-current={tab === k ? 'page' : undefined} className={tab === k ? 'is-on' : ''} onClick={() => go(k)}><Icon name={ic} size={22} /></button>)}
                </nav>
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
