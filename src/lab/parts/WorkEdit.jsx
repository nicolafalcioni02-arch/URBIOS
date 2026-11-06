import React from 'react';
import { Icon } from '../ui/icons';

// Modifica sul posto dell'esperimento al lavoro: la schermata resta identica, le righe si toccano e sotto il testo si apre il box per cambiarle.
// Righe cambiate o nuove sono segnate con un contorno scuro; il riepilogo è nella barra in alto.
const same = (a, b, keys) => !!a && !!b && keys.every((k) => String(a[k] || '') === String(b[k] || ''));
const MK = ['nome', 'quantita', 'unita', 'cond', 'pericolo', 'stanza'];
const SK = ['testo', 'durata', 'note', 'stanza'];

// stato di ogni riga rispetto a com'era all'apertura: '' | 'chg' | 'new'
export const diffOf = (d, base) => {
    const st = (list, b, keys) => (list || []).map((r, i) => (i >= (b || []).length ? 'new' : same(r, b[i], keys) ? '' : 'chg'));
    const mats = st(d.materiali, base.materiali, MK);
    const steps = st(d.passaggi, base.passaggi, SK);
    const place = ['stanza', 'posizioni'].some((k) => String(d[k] || '') !== String(base[k] || '')) ? 'chg' : '';
    const removed = Math.max(0, (base.materiali || []).length - (d.materiali || []).length) + Math.max(0, (base.passaggi || []).length - (d.passaggi || []).length);
    const total = mats.filter(Boolean).length + steps.filter(Boolean).length + (place ? 1 : 0) + removed;
    return { mats, steps, place, removed, total };
};

const Field = ({ label, children }) => <label className="we-f"><span>{label}</span>{children}</label>;
const Del = ({ onClick }) => <button type="button" className="we-x" onClick={onClick} aria-label="Togli questa riga"><Icon name="trash" size={18} />Togli</button>;

export const PlaceEditor = ({ d, commit }) => (
    <div className="we-ed" onClick={(e) => e.stopPropagation()}>
        <Field label="Stanza"><input value={d.stanza || ''} onChange={(e) => commit({ ...d, stanza: e.target.value }, 500)} /></Field>
        <Field label="Dove metto le cose"><textarea rows={2} value={d.posizioni || ''} onChange={(e) => commit({ ...d, posizioni: e.target.value }, 500)} /></Field>
    </div>
);

export const MatEditor = ({ d, i, commit, onGone, onAdd }) => {
    const m = d.materiali[i];
    const set = (k, v) => commit({ ...d, materiali: d.materiali.map((x, j) => (j === i ? { ...x, [k]: v } : x)) }, 500);
    return (
        <div className="we-ed" onClick={(e) => e.stopPropagation()}>
            <Field label="Nome"><input value={m.nome || ''} onChange={(e) => set('nome', e.target.value)} /></Field>
            <div className="we-2">
                <Field label="Quantità"><input inputMode="decimal" value={m.quantita || ''} onChange={(e) => set('quantita', e.target.value)} /></Field>
                <Field label="Unità"><input value={m.unita || ''} onChange={(e) => set('unita', e.target.value)} /></Field>
            </div>
            <div className="we-f"><span>Condizione</span>
                <div className="ms-chips">{[['', 'Automatica'], ['ice', 'Ghiaccio'], ['hazard', 'Pericolo'], ['none', 'Nessuna']].map(([k, l]) => <button key={k} type="button" className={(m.cond || '') === k ? 'on' : ''} onClick={() => set('cond', k)}>{l}</button>)}</div>
            </div>
            <Field label="Pericolo (frasi H)"><input value={m.pericolo || ''} placeholder="facoltativo" onChange={(e) => set('pericolo', e.target.value)} /></Field>
            <Field label="Stanza, se diversa"><input value={m.stanza || ''} placeholder={d.stanza || ''} onChange={(e) => set('stanza', e.target.value)} /></Field>
            <Add label="Aggiungi un materiale sotto" onClick={onAdd} />
            <Del onClick={() => { commit({ ...d, materiali: d.materiali.filter((_, j) => j !== i) }); onGone(); }} />
        </div>
    );
};

export const StepEditor = ({ d, i, commit, onGone, onAdd }) => {
    const s = d.passaggi[i];
    const set = (k, v) => commit({ ...d, passaggi: d.passaggi.map((x, j) => (j === i ? { ...x, [k]: v } : x)) }, 500);
    return (
        <div className="we-ed" onClick={(e) => e.stopPropagation()}>
            <Field label="Passaggio"><textarea rows={3} value={s.testo || ''} onChange={(e) => set('testo', e.target.value)} /></Field>
            <Field label="Durata"><input value={s.durata || ''} placeholder="es. 15 min" onChange={(e) => set('durata', e.target.value)} /></Field>
            <Field label="Nota"><textarea rows={2} value={s.note || ''} placeholder="facoltativa, es. ho usato un altro lotto" onChange={(e) => set('note', e.target.value)} /></Field>
            <Field label="Stanza, se diversa"><input value={s.stanza || ''} placeholder={d.stanza || ''} onChange={(e) => set('stanza', e.target.value)} /></Field>
            <Add label="Aggiungi un passaggio sotto" onClick={onAdd} />
            <Del onClick={() => { commit({ ...d, passaggi: d.passaggi.filter((_, j) => j !== i) }); onGone(); }} />
        </div>
    );
};

const Add = ({ label, onClick }) => <button type="button" className="we-add" onClick={onClick}><Icon name="plus" size={18} />{label}</button>;
