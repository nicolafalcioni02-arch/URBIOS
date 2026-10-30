import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { DAY_TYPES, macroGrams, typeKcal, typeLaf, typeLafDefault } from './guidedLogic';

const num = (v) => {
    const x = parseFloat(String(v).replace(',', '.'));
    return Number.isFinite(x) ? x : 0;
};

// Tipo di giornata: Riposo / Lavoro / Lavoro + allenamento / Personalizzata, con kcal dal LAF e macro modificabili.
export const DayTypeSheet = ({ day, calcData, targets, onApply, onClear, onLaf, onClose }) => {
    const planMacro = { c: targets.c, p: targets.p, f: targets.f };
    const t0 = day.targets && day.type ? day.targets : null;
    const [type, setType] = useState(day.type || '');
    const [laf, setLaf] = useState(day.lafType ?? '');
    const [kcal, setKcal] = useState(t0 ? String(Math.round(t0.kcal)) : '');
    const [mac, setMac] = useState(t0 ? { c: String(t0.c), p: String(t0.p), f: String(t0.f) } : { c: String(planMacro.c), p: String(planMacro.p), f: String(planMacro.f) });
    const [manual, setManual] = useState(!!t0 && day.type === 'custom');

    const pick = (id) => {
        setType(id);
        setManual(id === 'custom');
        if (id !== 'custom') {
            const l = id === 'rest' || id === 'work' || id === 'train' ? typeLaf(calcData, id) : typeLafDefault(calcData, id);
            setLaf(l);
            setKcal(String(typeKcal(calcData, l, targets.kcal)));
        } else if (!kcal) setKcal(String(Math.round(targets.kcal)));
    };
    const setLafValue = (v) => {
        setLaf(v);
        const l = num(v);
        if (l >= 1 && !manual) setKcal(String(typeKcal(calcData, l, targets.kcal)));
    };
    const sum = num(mac.c) + num(mac.p) + num(mac.f);
    const ok = !!type && num(kcal) > 0 && Math.round(sum) === 100;
    const g = macroGrams(num(kcal), { c: num(mac.c), p: num(mac.p), f: num(mac.f) });
    const diff = num(kcal) - targets.kcal;

    return createPortal(
        <div className="sheet-back" onClick={onClose}>
            <div className="sheet t-cellsheet" onClick={(e) => e.stopPropagation()}>
                <div className="t-cell-head">
                    <div className="min-w-0">
                        <p>Tipo di giornata</p>
                        <span>{day.title} · obiettivo del piano {Math.round(targets.kcal)} kcal</span>
                    </div>
                    <button type="button" className="dg-ghost" onClick={onClose} aria-label="Chiudi">
                        <i className="ph-bold ph-x"></i>
                    </button>
                </div>

                <div className="t-daytypes">
                    {DAY_TYPES.map((t) => (
                        <button key={t.id} className={type === t.id ? 'on' : ''} onClick={() => pick(t.id)} aria-pressed={type === t.id}>
                            <i className={`ph ${t.icon}`}></i>
                            <span>{t.label}</span>
                        </button>
                    ))}
                </div>

                {type && (
                    <>
                        <div className="t-dt-grid">
                            <label>
                                <small>LAF di questa giornata</small>
                                <input inputMode="decimal" value={laf} onChange={(e) => setLafValue(e.target.value)} placeholder="1,60" aria-label="LAF" disabled={type === 'custom'} />
                            </label>
                            <label>
                                <small>Kcal</small>
                                <input
                                    inputMode="numeric"
                                    value={kcal}
                                    onChange={(e) => {
                                        setKcal(e.target.value.replace(/[^\d]/g, ''));
                                        setManual(true);
                                    }}
                                    aria-label="Kcal della giornata"
                                />
                            </label>
                        </div>
                        {onLaf && type !== 'custom' && (
                            <button className="dg-link" style={{ marginTop: 8 }} onClick={() => onLaf((v) => setLafValue(String(v)))}>
                                <i className="ph ph-clock"></i> Calcola il LAF ora per ora
                            </button>
                        )}
                        <p className="t-dt-note">
                            {manual && type !== 'custom' ? 'Kcal modificate a mano. ' : ''}
                            {kcal && Math.abs(diff) >= 1 ? `${diff > 0 ? '+' : '−'}${Math.abs(Math.round(diff))} kcal rispetto all’obiettivo del piano.` : 'Uguale all’obiettivo del piano.'}
                        </p>

                        <p className="t-prev-h" style={{ marginTop: 14 }}>Macro (% delle kcal)</p>
                        <div className="t-dt-grid t-dt-mac">
                            {[
                                ['c', 'Carboidrati'],
                                ['p', 'Proteine'],
                                ['f', 'Grassi'],
                            ].map(([k, label]) => (
                                <label key={k}>
                                    <small>{label}</small>
                                    <input inputMode="numeric" value={mac[k]} onChange={(e) => setMac({ ...mac, [k]: e.target.value.replace(/[^\d]/g, '') })} aria-label={label} />
                                    <em>{g[k]} g</em>
                                </label>
                            ))}
                        </div>
                        {Math.round(sum) !== 100 && <p className="t-dt-note" style={{ color: '#C2413A' }}>I macro sommano {Math.round(sum)}%: devono fare 100%.</p>}
                    </>
                )}

                <div className="t-prev-foot" style={{ marginTop: 12 }}>
                    {day.type && (
                        <button type="button" className="vw-back" style={{ height: 52, borderRadius: 16, padding: '0 16px', flex: 'none', width: 'auto', whiteSpace: 'nowrap' }} onClick={() => { onClear(); onClose(); }}>
                            Togli il tipo
                        </button>
                    )}
                    <button
                        type="button"
                        className="vw-next"
                        style={{ height: 52, borderRadius: 16, flex: 1 }}
                        disabled={!ok}
                        onClick={() => {
                            onApply({ type, lafType: type === 'custom' ? undefined : num(laf) || undefined, targets: { kcal: num(kcal), c: num(mac.c), p: num(mac.p), f: num(mac.f) } });
                            onClose();
                        }}
                    >
                        Applica al giorno
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
