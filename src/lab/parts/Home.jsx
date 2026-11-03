import React from 'react';
import { Icon } from '../ui/icons';
import { SECTIONS, sectionOf } from '../sections';

// Panoramica essenziale: una frase di riepilogo, «Da fare» e le ultime pagine del quaderno. Tutto cliccabile.
const Row = ({ icon, title, sub, tone, onClick }) => (
    <button className="lab-row-i" onClick={onClick}>
        <span className="lab-ico"><Icon name={icon} /></span>
        <span className="min-w-0 flex-1"><b>{title}</b>{sub && <small>{sub}</small>}</span>
        {tone && <span className={`lab-dot ${tone}`} aria-hidden="true" />}
    </button>
);

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export const Home = ({ ov, onOpen, onNew }) => {
    const mag = sectionOf('magazzino');
    const q = sectionOf('quaderno');
    const camp = sectionOf('campioni');
    const todo = [
        ...ov.scaduti.map((r) => ({ id: r.id, key: 'magazzino', icon: mag.icon, tone: 'bad', title: mag.title(r), sub: 'Reagente scaduto' })),
        ...ov.scorta.map((r) => ({ id: r.id, key: 'magazzino', icon: mag.icon, tone: 'warn', title: mag.title(r), sub: 'Sotto scorta minima' })),
        ...ov.scadenza.map((r) => ({ id: r.id, key: 'magazzino', icon: mag.icon, tone: 'warn', title: mag.title(r), sub: mag.badge(r).label })),
        ...ov.inCorso.map((r) => ({ id: r.id, key: 'quaderno', icon: q.icon, tone: r.stato === 'Da ripetere' ? 'bad' : 'warn', title: q.title(r), sub: r.stato === 'Da ripetere' ? 'Da ripetere' : 'Esperimento in corso' })),
        ...ov.campioniAperti.map((r) => ({ id: r.id, key: 'campioni', icon: camp.icon, tone: '', title: camp.title(r), sub: `Campione ${String(r.stato).toLowerCase()}` })),
    ];
    const summary = todo.length ? `${plural(ov.inCorso.length, 'esperimento in corso', 'esperimenti in corso')}, ${plural(ov.scaduti.length + ov.scorta.length + ov.scadenza.length, 'avviso di magazzino', 'avvisi di magazzino')}.` : 'Tutto in ordine: niente in sospeso.';
    return (
        <div className="lab-page">
            <header className="lab-page-head">
                <div>
                    <h1 className="lab-title">Panoramica</h1>
                    <p className="lab-intro">{summary}</p>
                </div>
                <button className="lab-btn is-primary" onClick={() => onNew('quaderno')}><Icon name="plus" size={16} />Nuovo esperimento</button>
            </header>

            <section className="panel lab-block">
                <h3>Da fare</h3>
                {todo.length ? todo.slice(0, 7).map((t) => <Row key={t.key + t.id} icon={t.icon} tone={t.tone} title={t.title} sub={t.sub} onClick={() => onOpen(t.key, t.id)} />) : <p className="lab-none">Nessuna scadenza, scorta bassa o esperimento aperto.</p>}
                {todo.length > 7 && <p className="lab-none">e altri {todo.length - 7}: li trovi nelle singole aree.</p>}
            </section>

            <section className="panel lab-block">
                <h3>Ultime pagine del quaderno</h3>
                {ov.recenti.length ? ov.recenti.map((r) => <Row key={r.id} icon={q.icon} title={q.title(r)} sub={q.sub(r)} onClick={() => onOpen('quaderno', r.id)} />) : <p className="lab-none">Il quaderno è vuoto.</p>}
            </section>

            <div className="lab-quick">
                <span className="lab-side-label" style={{ padding: 0 }}>Crea</span>
                {SECTIONS.filter((s) => s.key !== 'quaderno').map((s) => <button key={s.key} className="vw-chip" onClick={() => onNew(s.key)}><Icon name={s.icon} size={16} />{s.single[0].toUpperCase() + s.single.slice(1)}</button>)}
            </div>
        </div>
    );
};
