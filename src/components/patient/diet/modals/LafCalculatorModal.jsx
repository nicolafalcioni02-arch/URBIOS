import React, { useState } from 'react';
import { LafInfo } from './LafInfo';
import { createPortal } from 'react-dom';

// Calcolatore LAF (metodo delle 24 ore): ogni attività ha un coefficiente (PAL) e le ore che occupa.
// LAF = Σ(PAL × ore) / 24, valido solo quando le ore sommano 24.
const level = (laf) => {
    const x = parseFloat(laf);
    if (!Number.isFinite(x)) return '';
    // fasce FAO/WHO/UNU 2001
    if (x < 1.7) return 'Sedentario o poco attivo';
    if (x < 2.0) return 'Attivo';
    return 'Molto attivo';
};
const fmt = (n) => String(Math.round(n * 100) / 100).replace('.', ',');
// più alto il coefficiente, più scuro il segmento
const shade = (pal) => `rgba(18,19,23,${Math.min(1, 0.14 + (Number(pal) || 0) * 0.14)})`;

const toMin = (t) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(t || ''));
    return m ? (Number(m[1]) * 60 + Number(m[2])) % 1440 : null;
};
const fmtT = (min) => `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
// durata in minuti di una fascia, anche a cavallo della mezzanotte (dalle 21 alle 8 = 11 h)
const durMin = (b) => {
    const a = toMin(b.start),
        e = toMin(b.end);
    return a === null || e === null || a === e ? 0 : (e - a + 1440) % 1440;
};

// Copertura della giornata: per ogni mezz'ora, quale fascia la occupa (-1 = buca, -2 = sovrapposta)
const coverage = (blocks) => {
    const cells = Array(48).fill(-1);
    blocks.forEach((b, bi) => {
        const a = toMin(b.start);
        const d = durMin(b);
        if (a === null || !d) return;
        for (let m = 0; m < d; m += 30) {
            const c = Math.floor(((a + m) % 1440) / 30);
            cells[c] = cells[c] === -1 ? bi : -2;
        }
    });
    return cells;
};

export const LafCalculatorModal = (props) => (props.isLafModalOpen ? <LafBody {...props} /> : null);

const LafBody = ({ onUseLaf, applyLafTemplate, calcData, calculatedLAF, lafActivities, setCalcData, setIsLafModalOpen, setLafActivities, totalLafHours }) => {
    const [mode, setMode] = useState('ore'); // 'ore' | 'orario'
    const [info, setInfo] = useState(false);
    const [blocks, setBlocks] = useState([]);
    const palOf = (id) => Number((lafActivities.find((a) => String(a.id) === String(id)) || {}).pal) || 0;
    const palB = (b) => (b.pal !== undefined && b.pal !== '' && Number.isFinite(parseFloat(String(b.pal).replace(',', '.'))) ? parseFloat(String(b.pal).replace(',', '.')) : palOf(b.actId));
    const nameOf = (id) => (lafActivities.find((a) => String(a.id) === String(id)) || {}).name || 'Attività';

    // da ore a orari: dispongo le attività una dopo l'altra, partendo da mezzanotte (poi le sposti)
    const toOrario = () => {
        let t = 0;
        const bl = [];
        lafActivities.forEach((a) => {
            const m = Math.round((Number(a.hours) || 0) * 2) * 30;
            if (m <= 0) return;
            bl.push({ id: `${a.id}-${bl.length}`, actId: a.id, start: fmtT(t), end: fmtT(t + m) });
            t += m;
        });
        setBlocks(bl.length ? bl : [{ id: 'b0', actId: lafActivities[0]?.id, start: '00:00', end: '08:00' }]);
        setMode('orario');
    };
    // da orari a ore: ogni attività prende le ore delle sue fasce
    const toOre = () => {
        setLafActivities(lafActivities.map((a) => ({ ...a, hours: Math.round(blocks.filter((b) => String(b.actId) === String(a.id)).reduce((x, b) => x + durMin(b), 0) / 30) / 2 })));
        setMode('ore');
    };
    const cells = mode === 'orario' ? coverage(blocks) : [];
    const gapH = cells.filter((c) => c === -1).length / 2;
    const overH = cells.filter((c) => c === -2).length / 2;
    const orarioOk = mode === 'orario' && blocks.length > 0 && gapH === 0 && overH === 0;
    const orarioLaf = orarioOk ? (blocks.reduce((x, b) => x + palB(b) * (durMin(b) / 60), 0) / 24).toFixed(2) : '---';
    const patchB = (id, f) => setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...f } : b)));
    const addBlock = () => {
        const last = blocks[blocks.length - 1];
        const st = last ? last.end : '08:00';
        const sm = toMin(st) ?? 480;
        setBlocks([...blocks, { id: 'b' + Date.now(), actId: lafActivities[1]?.id ?? lafActivities[0]?.id, start: st, end: fmtT(sm + 120) }]);
    };

    const okOre = Math.round(totalLafHours * 100) / 100 === 24;
    const total = Math.round(totalLafHours * 100) / 100;
    const ok = mode === 'orario' ? orarioOk : okOre;
    const diff = mode === 'orario' ? Math.round((gapH - overH) * 100) / 100 : Math.round((24 - total) * 100) / 100;
    const lafValue = mode === 'orario' ? orarioLaf : calculatedLAF;
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
                    <div className="lafm-btns">
                    <button className="lafm-x" onClick={() => setInfo(true)} aria-label="Informazioni e tabelle di riferimento">
                        <i className="ph ph-info"></i>
                    </button>
                    <button className="lafm-x" onClick={close} aria-label="Chiudi">
                        <i className="ph-bold ph-x"></i>
                    </button>
                    </div>
                </div>

                <div className="lafm-modes" role="tablist" aria-label="Come inserire le ore">
                    <button role="tab" aria-selected={mode === 'ore'} className={mode === 'ore' ? 'on' : ''} onClick={() => mode !== 'ore' && toOre()}>
                        <i className="ph ph-list-numbers"></i> Per ore
                    </button>
                    <button role="tab" aria-selected={mode === 'orario'} className={mode === 'orario' ? 'on' : ''} onClick={() => mode !== 'orario' && toOrario()}>
                        <i className="ph ph-clock"></i> Per orario
                    </button>
                </div>

                <div className="lafm-body">
                  {mode === 'orario' ? (
                    <>
                        <div className="lafm-clock" role="img" aria-label="La giornata ora per ora">
                            {cells.map((c, i) => (
                                <i key={i} className={c === -1 ? 'gap' : c === -2 ? 'over' : ''} style={c >= 0 ? { background: shade(palB(blocks[c])) } : undefined}></i>
                            ))}
                        </div>
                        <div className="lafm-scale lafm-scale4">
                            <span>00</span>
                            <span>06</span>
                            <span>12</span>
                            <span>18</span>
                            <span>24</span>
                        </div>
                        <p className="lafm-lab">Fasce della giornata</p>
                        <div className="lafm-list">
                            {blocks.map((b) => (
                                <div className="lafm-card" key={b.id}>
                                    <div className="lafm-top">
                                        <select className="lafm-name" value={b.actId} onChange={(e) => patchB(b.id, { actId: lafActivities.find((a) => String(a.id) === e.target.value)?.id, pal: undefined })} aria-label="Attività">
                                            {lafActivities.map((a) => (
                                                <option key={a.id} value={a.id}>{a.name}</option>
                                            ))}
                                        </select>
                                        <button className="lafm-del" onClick={() => setBlocks(blocks.filter((x) => x.id !== b.id))} aria-label="Elimina la fascia">
                                            <i className="ph ph-trash"></i>
                                        </button>
                                    </div>
                                    <div className="lafm-row">
                                        <label className="lafm-pal">
                                            <small>Dalle</small>
                                            <input type="time" step="1800" value={b.start} onChange={(e) => patchB(b.id, { start: e.target.value })} aria-label="Dalle" />
                                        </label>
                                        <label className="lafm-pal">
                                            <small>Alle</small>
                                            <input type="time" step="1800" value={b.end} onChange={(e) => patchB(b.id, { end: e.target.value })} aria-label="Alle" />
                                        </label>
                                        <div className="lafm-dur">
                                            <small>Durata</small>
                                            <b>{fmt(durMin(b) / 60)} h</b>
                                        </div>
                                    </div>
                                    <label className="lafm-palrow">
                                        <small>Coefficiente (PAL)</small>
                                        <input inputMode="decimal" value={b.pal ?? ''} placeholder={fmt(palOf(b.actId))} onChange={(e) => patchB(b.id, { pal: e.target.value })} aria-label="Coefficiente PAL della fascia" />
                                        {b.pal !== undefined && b.pal !== '' && (
                                            <button type="button" className="lafm-reset" onClick={() => patchB(b.id, { pal: undefined })}>
                                                Ripristina {fmt(palOf(b.actId))}
                                            </button>
                                        )}
                                    </label>
                                </div>
                            ))}
                            <button className="lafm-add" onClick={addBlock}>
                                <i className="ph ph-plus-circle"></i> Aggiungi fascia
                            </button>
                        </div>
                        <p className="lafm-hint">Esempio: “dalle 21 alle 08” è il sonno (11 ore, a cavallo della mezzanotte). Il coefficiente di ogni fascia si può scrivere a mano: se lo lasci vuoto vale quello dell’attività.</p>
                    </>
                  ) : (
                  <>
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
                                    <input className="lafm-name" value={a.name} onChange={(e) => patch(a.id, { name: e.target.value })} aria-label="Nome dell’attività" placeholder="Nome dell’attività" />
                                    <button className="lafm-del" onClick={() => setLafActivities(lafActivities.filter((x) => x.id !== a.id))} aria-label={`Elimina ${a.name}`}>
                                        <i className="ph ph-trash"></i>
                                    </button>
                                </div>
                                {a.note && <p className="lafm-warn"><i className="ph ph-info"></i> {a.note}</p>}
                                <div className="lafm-row">
                                    <label className="lafm-pal">
                                        <small>Coefficiente (PAL)</small>
                                        <input inputMode="decimal" value={a.pal} onChange={(e) => patch(a.id, { pal: e.target.value, note: undefined })} onBlur={(e) => patch(a.id, { pal: num(e.target.value) })} aria-label="Coefficiente PAL" />
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
                  </>
                  )}
                </div>

                <div className="lafm-foot">
                    <div className={`lafm-res ${ok ? 'ok' : 'no'}`}>
                        <div>
                            <small>
                                {ok
                                    ? 'Ore'
                                    : mode === 'orario'
                                      ? [gapH > 0 && `Mancano ${fmt(gapH)} h`, overH > 0 && `Si sovrappongono ${fmt(overH)} h`].filter(Boolean).join(' · ') || 'Aggiungi una fascia'
                                      : diff > 0
                                        ? `Mancano ${fmt(diff)} h`
                                        : `Eccedono ${fmt(-diff)} h`}
                            </small>
                            <b>{mode === 'orario' ? fmt(24 - gapH) : fmt(total)} / 24</b>
                        </div>
                        <div>
                            <small>LAF{ok ? ` · ${level(lafValue)}` : ''}</small>
                            <b className="big">{ok ? lafValue : '—'}</b>
                        </div>
                    </div>
                    <button
                        className="lafm-go"
                        disabled={!ok}
                        onClick={() => {
                            if (onUseLaf) onUseLaf(parseFloat(lafValue));
                            else setCalcData({ ...calcData, laf: parseFloat(lafValue), guided: { ...(calcData.guided || {}), activity: 'custom' } });
                            close();
                        }}
                    >
                        {onUseLaf ? 'Usa per questa giornata' : 'Usa nel piano'} <i className="ph ph-arrow-right"></i>
                    </button>
                </div>
            </div>
            {info && (
                <LafInfo
                    onClose={() => setInfo(false)}
                    sex={calcData.sex}
                    onAdd={(name, pal, note) => setLafActivities([...lafActivities, { id: Date.now() + Math.random(), name, pal, hours: 0, ...(note ? { note } : {}) }])}
                    activities={lafActivities}
                />
            )}
        </div>,
        document.body
    );
};
