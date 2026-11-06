import React, { useEffect, useState } from 'react';
import { Icon } from '../ui/icons';
import { Convert } from '../Convert';
import { Grams } from '../Grams';
import { Dilution } from '../Calc';

// Calcolatrice semplice (come quella dell'iPhone): quattro operazioni, %, ±, concatenate. Stili m-calc* in mobileStyles.js
const OPS = { '÷': (a, b) => a / b, '×': (a, b) => a * b, '−': (a, b) => a - b, '+': (a, b) => a + b, '^': (a, b) => a ** b };
const fact = (x) => (Number.isInteger(x) && x >= 0 && x <= 170 ? Array.from({ length: x }, (_, i) => i + 1).reduce((p, n) => p * n, 1) : NaN);
// funzioni scientifiche su un solo numero (l'esponenziale è eˣ e 10ˣ, la potenza è xʸ)
const FN = { '√': Math.sqrt, '∛': Math.cbrt, 'x²': (x) => x * x, '1/x': (x) => 1 / x, log: Math.log10, ln: Math.log, 'eˣ': Math.exp, '10ˣ': (x) => 10 ** x, 'x!': fact };
const fmt = (s) => {
    if (s === 'Errore') return s;
    const [i, d] = String(s).split('.');
    const int = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return d === undefined ? int : `${int},${d}`;
};
const clean = (n) => (Number.isFinite(n) ? String(parseFloat(n.toPrecision(10))) : 'Errore');

const KEY = 'urbios.lab.calc';
const MODES = [['calc', 'Calcola'], ['gr', 'Grammi'], ['conv', 'Converti'], ['dil', 'Diluizione']];
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };

export const Calculator = () => {
    const [hist, setHist] = useState(load); // [{ e: '12 × 3 + 4', r: '40' }], la più recente per prima
    const [showHist, setShowHist] = useState(false);
    const [mode, setMode] = useState('calc');
    const [sci, setSci] = useState(false);
    const [expr, setExpr] = useState('');
    useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(hist.slice(0, 50))); } catch { /* senza archivio: solo sessione */ } }, [hist]);
    const [cur, setCur] = useState('0'); // numero sul display
    const [acc, setAcc] = useState(null); // primo operando
    const [op, setOp] = useState(null);
    const [fresh, setFresh] = useState(true); // il prossimo numero sostituisce il display

    const digit = (d) => {
        if (cur === 'Errore') { setCur(d); setFresh(false); return; }
        if (fresh) { setCur(d); setFresh(false); } else if (cur.replace(/[-.]/g, '').length < 12) setCur(cur === '0' ? d : cur + d);
    };
    const dot = () => { if (fresh) { setCur('0.'); setFresh(false); } else if (!cur.includes('.')) setCur(cur + '.'); };
    const fn = (name) => {
        const x = parseFloat(cur);
        if (cur === 'Errore' || !Number.isFinite(x)) return;
        setCur(clean(FN[name](x))); setFresh(true);
    };
    const konst = (v) => { setCur(clean(v)); setFresh(false); };
    const run = () => (acc !== null && op ? clean(OPS[op](acc, parseFloat(cur))) : cur);
    const pick = (o) => {
        if (fresh && op) { setOp(o); setExpr((e) => e.replace(/.$/, o)); return; }
        setExpr((e) => `${e}${fmt(cur)}${o}`);
        const v = run();
        setAcc(v === 'Errore' ? null : parseFloat(v)); setCur(v); setOp(o); setFresh(true);
    };
    const equal = () => { if (!op) return; const r = run(); setHist((h) => [{ e: `${expr}${fmt(cur)}`.replace(/([÷×−+^])/g, ' $1 '), r }, ...h].slice(0, 50)); setExpr(''); setCur(r); setAcc(null); setOp(null); setFresh(true); };
    const clear = () => { setCur('0'); if (cur === '0' || fresh) { setAcc(null); setOp(null); setExpr(''); } setFresh(true); };
    const sign = () => { if (cur !== '0' && cur !== 'Errore') setCur(cur.startsWith('-') ? cur.slice(1) : `-${cur}`); };
    const pct = () => { if (cur !== 'Errore') { setCur(clean(parseFloat(cur) / 100)); setFresh(true); } };

    const keys = [
        { l: cur === '0' || fresh ? 'AC' : 'C', k: 'fn', f: clear, label: 'Azzera' }, { l: '±', k: 'fn', f: sign, label: 'Cambia segno' }, { l: '%', k: 'fn', f: pct, label: 'Percentuale' }, { l: '÷', k: 'op', f: () => pick('÷') },
        ...['7', '8', '9'].map((d) => ({ l: d, f: () => digit(d) })), { l: '×', k: 'op', f: () => pick('×') },
        ...['4', '5', '6'].map((d) => ({ l: d, f: () => digit(d) })), { l: '−', k: 'op', f: () => pick('−') },
        ...['1', '2', '3'].map((d) => ({ l: d, f: () => digit(d) })), { l: '+', k: 'op', f: () => pick('+') },
        { l: '0', k: 'zero', f: () => digit('0') }, { l: ',', f: dot, label: 'Virgola' }, { l: '=', k: 'op', f: equal },
    ];
    const sciKeys = [
        ...['√', '∛', 'x²', '1/x'].map((l) => ({ l, f: () => fn(l) })),
        { l: 'xʸ', op: '^', f: () => pick('^') }, ...['log', 'ln', 'x!'].map((l) => ({ l, f: () => fn(l) })),
        ...['eˣ', '10ˣ'].map((l) => ({ l, f: () => fn(l) })), { l: 'π', f: () => konst(Math.PI) }, { l: 'e', f: () => konst(Math.E) },
    ];
    const size = fmt(cur).length > 11 ? 'xs' : fmt(cur).length > 8 ? 's' : '';
    return (
        <div className="m-screen m-calc">
            <header className="m-bar">
                <div className="m-modes" role="tablist">
                    {MODES.map(([k, l]) => <button key={k} role="tab" aria-selected={mode === k} className={mode === k ? 'on' : ''} onClick={() => { setMode(k); setShowHist(false); }}>{l}</button>)}
                </div>
                {mode === 'calc' && <button className={`m-ib m-fx${sci ? ' on' : ''}`} onClick={() => setSci((v) => !v)} aria-label="Funzioni scientifiche" aria-pressed={sci}>fx</button>}
                {mode === 'calc' && <button className={`m-ib${showHist ? ' on' : ''}`} onClick={() => setShowHist((v) => !v)} aria-label="Cronologia" aria-pressed={showHist}><Icon name="clock" size={22} /></button>}
            </header>
            {mode !== 'calc' ? (
                <div className="m-tools">{mode === 'gr' ? <Grams /> : mode === 'conv' ? <Convert /> : <Dilution />}</div>
            ) : showHist ? (
                <div className="m-hist">
                    {hist.length === 0 && <p>Nessun calcolo</p>}
                    {hist.map((h, i) => (
                        <button key={i} onClick={() => { setCur(h.r); setFresh(true); setAcc(null); setOp(null); setExpr(''); setShowHist(false); }}>
                            <small>{h.e} =</small><b>{fmt(h.r)}</b>
                        </button>
                    ))}
                    {hist.length > 0 && <button className="m-hist-clear" onClick={() => setHist([])}>Cancella cronologia</button>}
                </div>
            ) : (
                <>
                    <div className="m-calc-expr">{expr.replace(/([÷×−+^])/g, ' $1 ')}</div>
                    <div className={`m-calc-out ${size}`} aria-live="polite">{fmt(cur)}</div>
                </>
            )}
            {mode === 'calc' && sci && !showHist && (
                <div className="m-calc-sci">
                    {sciKeys.map((k) => <button key={k.l} className={`m-ck sci${k.op && op === k.op && fresh ? ' on' : ''}`} onClick={k.f}>{k.l}</button>)}
                </div>
            )}
            {mode === 'calc' && <div className={`m-calc-keys${sci ? ' sm' : ''}`}>
                {keys.map((k) => <button key={k.l} className={`m-ck ${k.k || ''}${k.k === 'op' && op === k.l && fresh ? ' on' : ''}`} onClick={k.f} aria-label={k.label}>{k.l}</button>)}
            </div>}
        </div>
    );
};
