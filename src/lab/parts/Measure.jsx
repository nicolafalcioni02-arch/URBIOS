import React, { useState } from 'react';
import { Icon } from '../ui/icons';

// Misure registrate durante il lavoro (peso del campione, tampone aggiunto, temperatura…): `misure` = [{ nome, valore, unita, note }]
const NAMES = [['Peso campione', 'mg'], ['Volume tampone', 'µL'], ['Temperatura', '°C'], ['pH', ''], ['Concentrazione', 'mg/mL'], ['Tempo', 'min']];
const UNITS = ['mg', 'g', 'µg', 'µL', 'mL', '°C', 'min', 'rpm'];
const MASS = { µg: 1e-3, mg: 1, g: 1e3, kg: 1e6 };
const VOL = { µL: 1, mL: 1e3, L: 1e6 };
const num = (v) => { const x = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(x) ? x : NaN; };
const fmt = (x) => (Math.round(x * 100) / 100).toString().replace('.', ',');

// peso e volume registrati insieme: quanti µL per mg (es. tampone sul campione)
const ratio = (list) => {
    const m = [...list].reverse().find((x) => MASS[x.unita] && num(x.valore) > 0);
    const v = [...list].reverse().find((x) => VOL[x.unita] && num(x.valore) > 0);
    if (!m || !v) return null;
    return `${fmt((num(v.valore) * VOL[v.unita]) / (num(m.valore) * MASS[m.unita]))} µL per mg (${v.nome || 'volume'} su ${m.nome || 'peso'})`;
};

export const Measures = ({ list, onChange }) => {
    const [sheet, setSheet] = useState(null); // { i: indice | -1, row }
    const open = (i) => setSheet({ i, row: i >= 0 ? { ...list[i] } : { nome: '', valore: '', unita: '', note: '' } });
    const r = ratio(list);
    return (
        <>
            <h3>Misure</h3>
            {list.length > 0 && (
                <div className="m-list">
                    {list.map((x, i) => (
                        <button key={i} type="button" className="m-row m-stepw" onClick={() => open(i)}>
                            <span className="m-row-t m-wrap"><b>{x.nome || 'Misura'}</b>{x.note && <small>{x.note}</small>}</span>
                            <span className="m-qty m-qty-big">{[x.valore, x.unita].filter(Boolean).join(' ')}</span>
                        </button>
                    ))}
                </div>
            )}
            {r && <p className="ms-ratio">{r}</p>}
            <button type="button" className="we-add" onClick={() => open(-1)}><Icon name="plus" size={18} />Registra una misura</button>
            {sheet && <MeasureSheet key={sheet.i} {...sheet} names={[...new Set([...list.map((x) => x.nome).filter(Boolean), ...NAMES.map((n) => n[0])])]} onClose={() => setSheet(null)}
                onSave={(row) => { onChange(sheet.i >= 0 ? list.map((x, k) => (k === sheet.i ? row : x)) : [...list, row]); setSheet(null); }}
                onDelete={sheet.i >= 0 ? () => { onChange(list.filter((_, k) => k !== sheet.i)); setSheet(null); } : null} />}
        </>
    );
};

const MeasureSheet = ({ row, names, onClose, onSave, onDelete }) => {
    const [d, setD] = useState(row);
    const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
    const pickName = (n) => { const u = (NAMES.find((a) => a[0] === n) || [])[1]; setD((x) => ({ ...x, nome: n, unita: x.unita || u || '' })); };
    const ok = String(d.valore).trim() !== '' && String(d.nome).trim() !== '';
    return (
        <div className="ui-back" onClick={onClose}>
            <div className="ui-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Misura">
                <header><h3>{onDelete ? 'Misura' : 'Registra una misura'}</h3><button type="button" onClick={onClose} aria-label="Chiudi"><Icon name="x" size={20} /></button></header>
                <div className="ui-body">
                    <div className="ms-chips">{names.map((n) => <button key={n} type="button" className={d.nome === n ? 'on' : ''} onClick={() => pickName(n)}>{n}</button>)}</div>
                    <label className="wh-f"><span>Cosa hai misurato</span><input value={d.nome} placeholder="es. Peso fegato" onChange={(e) => set('nome', e.target.value)} /></label>
                    <label className="wh-f wh-big"><span>Valore</span><input inputMode="decimal" autoFocus value={d.valore} placeholder="0" onChange={(e) => set('valore', e.target.value)} /></label>
                    <div className="ms-chips">{UNITS.map((u) => <button key={u} type="button" className={d.unita === u ? 'on' : ''} onClick={() => set('unita', u)}>{u}</button>)}</div>
                    <label className="wh-f"><span>Unità</span><input value={d.unita} onChange={(e) => set('unita', e.target.value)} /></label>
                    <label className="wh-f"><span>Nota</span><input value={d.note || ''} placeholder="facoltativa" onChange={(e) => set('note', e.target.value)} /></label>
                    <button type="button" className="wh-add" disabled={!ok} onClick={() => onSave(d)}>Salva misura</button>
                    {onDelete && <button type="button" className="ms-del" onClick={onDelete}>Elimina misura</button>}
                </div>
            </div>
        </div>
    );
};
