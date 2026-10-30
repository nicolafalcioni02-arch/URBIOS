import React from 'react';
import { loadFromPct, pctFromLoad } from '../../logic/science/oneRm';

const TIPI = [
    ['', 'Serie di lavoro'],
    ['riscaldamento', 'Serie di riscaldamento (non conta nel volume)'],
    ['drop', 'Drop set (riduzione del carico senza recupero)'],
];
const BADGE = { '': { bg: '#E6E4DE', fg: '#6E6D69' }, riscaldamento: { bg: '#FFF1D6', fg: '#B26A00' }, drop: { bg: '#EEE2FF', fg: '#6B3FC2' } };

// Una riga di serie. Il pallino col numero cambia il tipo (lavoro → riscaldamento → drop).
export const SetRow = ({ set, index, cardio, oneRm, onChange, onRemove }) => {
    const tipo = set.tipo || '';
    const b = BADGE[tipo] || BADGE[''];
    const nextTipo = () => TIPI[(TIPI.findIndex(([t]) => t === tipo) + 1) % TIPI.length][0];
    const derivedLoad = oneRm && set.pct && !set.load ? loadFromPct(oneRm, parseFloat(String(set.pct).replace(',', '.')), 0.5) : null;
    const derivedPct = oneRm && set.load && !set.pct ? pctFromLoad(oneRm, parseFloat(String(set.load).replace(',', '.'))) : null;
    const inp = (field, placeholder, extra = {}) => (
        <input type="text" value={set[field] ?? ''} placeholder={placeholder} onChange={(e) => onChange(field, e.target.value)} {...extra} />
    );
    return (
        <tr style={tipo === 'riscaldamento' ? { background: '#FFFBF2' } : tipo === 'drop' ? { background: '#F7F2FF' } : undefined}>
            <td>
                <div
                    className="t-set-badge"
                    title={TIPI.find(([t]) => t === tipo)[1] + ' · clicca per cambiare'}
                    style={{ background: b.bg, color: b.fg, cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => onChange('tipo', nextTipo())}
                >
                    {tipo === 'riscaldamento' ? 'R' : tipo === 'drop' ? 'D' : index + 1}
                </div>
            </td>
            <td>{inp('reps', cardio ? "20'" : '10')}</td>
            {!cardio && <td>{inp('load', derivedLoad !== null ? String(derivedLoad) : 'kg')}</td>}
            {!cardio && <td>{inp('pct', derivedPct !== null ? String(Math.round(derivedPct)) : '%')}</td>}
            <td>{inp('rpe', '8')}</td>
            {!cardio && <td>{inp('tempo', '3-1-1-0')}</td>}
            <td>{inp('rec', "90''")}</td>
            <td>{inp('note', cardio ? 'Intensità, zona FC...' : 'Esecuzione controllata...')}</td>
            <td style={{ textAlign: 'center' }}>
                <i className="ph ph-x" style={{ cursor: 'pointer', color: '#C2413A' }} onClick={onRemove}></i>
            </td>
        </tr>
    );
};

// La stessa serie su telefono: in alto i numeri che si toccano di più (reps, kg, %1RM, RPE),
// sotto tempo, recupero e nota con la loro etichetta. Niente tabella da scorrere di lato.
export const SetRowCompact = ({ set, index, cardio, oneRm, onChange, onRemove, detail = false, noRec = false, recLabel = 'Rec.' }) => {
    const tipo = set.tipo || '';
    const b = BADGE[tipo] || BADGE[''];
    const nextTipo = () => TIPI[(TIPI.findIndex(([t]) => t === tipo) + 1) % TIPI.length][0];
    const derivedLoad = oneRm && set.pct && !set.load ? loadFromPct(oneRm, parseFloat(String(set.pct).replace(',', '.')), 0.5) : null;
    const derivedPct = oneRm && set.load && !set.pct ? pctFromLoad(oneRm, parseFloat(String(set.load).replace(',', '.'))) : null;
    const inp = (field, placeholder, label) => (
        <input type="text" inputMode={['load', 'pct', 'rpe'].includes(field) ? 'decimal' : undefined} value={set[field] ?? ''} placeholder={placeholder} aria-label={label} onChange={(e) => onChange(field, e.target.value)} />
    );
    const extra = (field, label, placeholder) => (
        <label className={`t-setc-f ${field === 'note' ? 'wide' : field === 'rec' ? 'rec' : ''}`}>
            <span>{label}</span>
            <input type="text" value={set[field] ?? ''} placeholder={placeholder} onChange={(e) => onChange(field, e.target.value)} />
        </label>
    );
    return (
        <div className={`t-setc ${tipo === 'riscaldamento' ? 'warm' : tipo === 'drop' ? 'drop' : ''}`}>
            <div className={`t-setc-row ${cardio ? 'cardio' : ''}`}>
                <button
                    type="button"
                    className="t-set-badge"
                    aria-label={`${TIPI.find(([t]) => t === tipo)[1]}: tocca per cambiare tipo`}
                    style={{ background: b.bg, color: b.fg }}
                    onClick={() => onChange('tipo', nextTipo())}
                >
                    {tipo === 'riscaldamento' ? 'R' : tipo === 'drop' ? 'D' : index + 1}
                </button>
                {inp('reps', cardio ? "20'" : '10', cardio ? 'Durata' : 'Ripetizioni')}
                {!cardio && inp('load', derivedLoad !== null ? String(derivedLoad) : 'kg', 'Carico in kg')}
                {inp('rpe', '8', 'RPE')}
                <button type="button" className="t-setc-del" onClick={onRemove} aria-label="Elimina la serie">
                    <i className="ph ph-x"></i>
                </button>
            </div>
            {detail && <div className="t-setc-more">
                {!cardio && extra('pct', '%1RM', derivedPct !== null ? String(Math.round(derivedPct)) : '%')}
                {!cardio && extra('tempo', 'Tempo', '3-1-1-0')}
                {!noRec && extra('rec', recLabel, "90''")}
                {extra('note', 'Nota', cardio ? 'zona FC...' : '')}
            </div>}
        </div>
    );
};
