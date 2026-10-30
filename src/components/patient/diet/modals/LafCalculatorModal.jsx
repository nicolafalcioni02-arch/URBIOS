import React from 'react';
import { createPortal } from 'react-dom';

// Calcolatore LAF (metodo delle 24 ore): ogni attività ha un coefficiente (PAL) e le ore che occupa.
// LAF = Σ(PAL × ore) / 24, valido solo quando le ore sommano 24.
const level = (laf) => {
    const x = parseFloat(laf);
    if (!Number.isFinite(x)) return '';
    if (x < 1.5) return 'Sedentario';
    if (x < 1.7) return 'Leggermente attivo';
    if (x < 2.0) return 'Moderatamente attivo';
    return 'Molto attivo';
};
const fmt = (n) => String(Math.round(n * 100) / 100).replace('.', ',');
// più alto il coefficiente, più scuro il segmento
const shade = (pal) => `rgba(18,19,23,${Math.min(1, 0.14 + (Number(pal) || 0) * 0.14)})`;

export const LafCalculatorModal = ({ applyLafTemplate, calcData, calculatedLAF, isLafModalOpen, lafActivities, setCalcData, setIsLafModalOpen, setLafActivities, totalLafHours }) => {
    if (!isLafModalOpen) return null;
    const total = Math.round(totalLafHours * 100) / 100;
    const ok = total === 24;
    const diff = Math.round((24 - total) * 100) / 100;
    const close = () => setIsLafModalOpen(false);
    const patch = (id, fields) => setLafActivities(lafActivities.map((a) => (a.id === id ? { ...a, ...fields } : a)));
    const addHours = (a, d) => patch(a.id, { hours: Math.min(24, Math.max(0, Math.round(((Number(a.hours) || 0) + d) * 2) / 2)) });
    const num = (v) => {
        const x = parseFloat(String(v).replace(',', '.'));
        return Number.isFinite(x) ? x : 0;
    };

    return createPortal(
        <div className="lafm-back" onClick={close}>
            <div className="lafm" role="dialog" aria-label="Calcolatore LAF" onClick={(e) => e.stopPropagation()}>
                <div className="lafm-head">
                    <div>
                        <h3>Calcolatore LAF</h3>
                        <span>Come passa le 24 ore: attività, coefficiente e ore</span>
                    </div>
                    <button className="lafm-x" onClick={close} aria-label="Chiudi">
                        <i className="ph-bold ph-x"></i>
                    </button>
                </div>

                <div className="lafm-body">
                    <p className="lafm-lab">Parti da una giornata tipo</p>
                    <div className="lafm-tpl">
                        {[
                            ['sedentario', 'Sedentario'],
                            ['leggero', 'Leggero'],
                            ['attivo', 'Attivo'],
                        ].map(([id, label]) => (
                            <button key={id} onClick={() => applyLafTemplate(id)}>
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="lafm-day" role="img" aria-label="Le 24 ore divise per attività">
                        {lafActivities.map((a) => (
                            <i key={a.id} title={`${a.name}: ${a.hours} h`} style={{ flex: `${Math.max(0, Number(a.hours) || 0)} 0 0`, background: shade(a.pal) }}></i>
                        ))}
                    </div>
                    <div className="lafm-scale">
                        <span>0</span>
                        <span>12</span>
                        <span>24 h</span>
                    </div>

                    <p className="lafm-lab">Attività</p>
                    <div className="lafm-list">
                        {lafActivities.map((a) => (
                            <div className="lafm-card" key={a.id}>
                                <div className="lafm-top">
                                    <span className="lafm-dot" style={{ background: shade(a.pal) }}></span>
                                    <input className="lafm-name" value={a.name} onChange={(e) => patch(a.id, { name: e.target.value })} aria-label="Nome dell’attività" placeholder="Nome dell’attività" />
                                    <button className="lafm-del" onClick={() => setLafActivities(lafActivities.filter((x) => x.id !== a.id))} aria-label={`Elimina ${a.name}`}>
                                        <i className="ph ph-trash"></i>
                                    </button>
                                </div>
                                <div className="lafm-row">
                                    <label className="lafm-pal">
                                        <small>Coefficiente (PAL)</small>
                                        <input inputMode="decimal" value={a.pal} onChange={(e) => patch(a.id, { pal: e.target.value })} onBlur={(e) => patch(a.id, { pal: num(e.target.value) })} aria-label="Coefficiente PAL" />
                                    </label>
                                    <div className="lafm-step">
                                        <small>Ore</small>
                                        <div>
                                            <button onClick={() => addHours(a, -0.5)} aria-label="Meno mezz’ora"><i className="ph ph-minus"></i></button>
                                            <input inputMode="decimal" value={a.hours} onChange={(e) => patch(a.id, { hours: e.target.value })} onBlur={(e) => patch(a.id, { hours: Math.min(24, Math.max(0, num(e.target.value))) })} aria-label="Ore" />
                                            <button onClick={() => addHours(a, 0.5)} aria-label="Più mezz’ora"><i className="ph ph-plus"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button className="lafm-add" onClick={() => setLafActivities([...lafActivities, { id: Date.now(), name: 'Nuova attività', pal: 1.5, hours: 0 }])}>
                            <i className="ph ph-plus-circle"></i> Aggiungi attività
                        </button>
                    </div>
                    <p className="lafm-hint">Riferimenti: sonno 0,95 · seduto 1,2–1,5 · cammino lento 2,5 · cammino veloce 3,5 · sport intenso 5–6.</p>
                </div>

                <div className="lafm-foot">
                    <div className={`lafm-res ${ok ? 'ok' : 'no'}`}>
                        <div>
                            <small>{ok ? 'Ore' : diff > 0 ? `Mancano ${fmt(diff)} h` : `Eccedono ${fmt(-diff)} h`}</small>
                            <b>{fmt(total)} / 24</b>
                        </div>
                        <div>
                            <small>LAF{ok ? ` · ${level(calculatedLAF)}` : ''}</small>
                            <b className="big">{ok ? calculatedLAF : '—'}</b>
                        </div>
                    </div>
                    <button
                        className="lafm-go"
                        disabled={!ok}
                        onClick={() => {
                            setCalcData({ ...calcData, laf: parseFloat(calculatedLAF), guided: { ...(calcData.guided || {}), activity: 'custom' } });
                            close();
                        }}
                    >
                        Usa nel piano <i className="ph ph-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
