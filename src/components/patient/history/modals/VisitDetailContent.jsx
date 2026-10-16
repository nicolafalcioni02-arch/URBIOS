import React from 'react';
import { DEFAULT_RANGE_EMATO } from '../../../../logic/db_defaults';
import { BLOOD_GROUPS, MEASURE_GROUPS, LIFESTYLE, TEXT_BLOCKS, isHandled, prettyKey, num, fmt, bmiOf, bmiBand, rangeOf } from './visitDetailLogic';
import { fmtDelta } from '../sections/historyFormat';

const Section = ({ icon, title, count, children }) => (
    <section className="vd-sec">
        <h4 className="vd-h">
            <span className="vd-h-ico">
                <i className={`ph ${icon}`}></i>
            </span>
            {title}
            {count ? <span className="vd-h-count">{count}</span> : null}
        </h4>
        {children}
    </section>
);

const STATE_TEXT = { low: 'sotto il range', high: 'sopra il range', ok: 'nel range' };

const BloodCell = ({ k, value, sesso }) => {
    const cfg = DEFAULT_RANGE_EMATO[k];
    const r = rangeOf(k, value, sesso);
    return (
        <div className={`vd-lab ${r ? `is-${r.state}` : ''}`}>
            <p className="vd-lab-name" title={cfg.label}>
                {cfg.label}
            </p>
            <p className="vd-lab-val">
                {fmt(value, 2)}
                {cfg.unit && <small>{cfg.unit}</small>}
            </p>
            {r ? (
                <>
                    <div className="vd-track" aria-hidden="true">
                        <span className="vd-track-ok"></span>
                        <span className="vd-track-dot" style={{ left: `${r.pos * 100}%` }}></span>
                    </div>
                    <p className="vd-lab-note">
                        {r.state === 'ok' ? `${fmt(r.min, 2)}–${fmt(r.max, 2)}` : STATE_TEXT[r.state]}
                    </p>
                </>
            ) : null}
        </div>
    );
};

export const VisitDetailContent = ({ selectedVisit, previousVisit, sesso }) => {
    if (!selectedVisit) return null;
    const d = selectedVisit.dettagli || {};

    const bmi = bmiOf(selectedVisit.peso, d.altezza);
    const band = bmiBand(bmi);
    const delta = previousVisit && num(selectedVisit.peso) !== null && num(previousVisit.peso) !== null ? Number((selectedVisit.peso - previousVisit.peso).toFixed(1)) : null;

    const has = (k) => d[k] !== undefined && d[k] !== null && d[k] !== '';
    const bloodGroups = BLOOD_GROUPS.map((g) => ({ ...g, keys: Object.keys(DEFAULT_RANGE_EMATO).filter((k) => g.test(k) && has(k)) }));
    const grouped = new Set(bloodGroups.flatMap((g) => g.keys));
    const otherBlood = Object.keys(DEFAULT_RANGE_EMATO).filter((k) => has(k) && !grouped.has(k));
    if (otherBlood.length) bloodGroups.push({ id: 'oth', title: 'Altri esami', keys: otherBlood });
    const bloodShown = bloodGroups.filter((g) => g.keys.length);
    const bloodCount = bloodShown.reduce((n, g) => n + g.keys.length, 0);

    const measureShown = MEASURE_GROUPS.map((g) => ({ ...g, rows: g.items.filter(([k]) => has(k)) })).filter((g) => g.rows.length);
    const whr = num(d.cm_vita_min) && num(d.cm_fianchi_max) ? num(d.cm_vita_min) / num(d.cm_fianchi_max) : null;

    const vitals = [];
    if (has('pa_max') || has('pa_min')) vitals.push({ icon: 'ph-heartbeat', label: 'Pressione', value: `${fmt(d.pa_max, 0) || '–'}/${fmt(d.pa_min, 0) || '–'}`, unit: 'mmHg' });
    if (has('hr')) vitals.push({ icon: 'ph-pulse', label: 'Frequenza cardiaca', value: fmt(d.hr, 0), unit: 'bpm' });
    if (has('spo2')) vitals.push({ icon: 'ph-wind', label: 'Saturazione', value: fmt(d.spo2, 0), unit: '%' });
    const customMeasures = Array.isArray(d.misure_extra) ? d.misure_extra.filter((m) => m && (String(m.nome || '').trim() || String(m.valore || '').trim())) : [];
    const customFolds = Array.isArray(d.pliche_extra) ? d.pliche_extra.filter((m) => m && (String(m.nome || '').trim() || String(m.valore || '').trim())) : [];
    const lifestyle = LIFESTYLE.filter(([k]) => has(k));
    const texts = TEXT_BLOCKS.filter(([k]) => has(k));
    const extra = Object.entries(d).filter(([k, v]) => !isHandled(k) && v && typeof v !== 'object');
    const metodoA = d.risultati_metodo_A && typeof d.risultati_metodo_A === 'object' ? Object.entries(d.risultati_metodo_A) : [];

    return (
        <div className="vd-body stagger">
            <div className="vd-hero">
                <div className="vd-weight">
                    <p className="vd-weight-label">Peso</p>
                    <p className="vd-weight-fig">
                        {fmt(selectedVisit.peso)}
                        <span>kg</span>
                    </p>
                    <p className="vd-weight-delta">
                        {delta === null ? (
                            'prima misura'
                        ) : (
                            <>
                                <i className={`ph-bold ${delta < 0 ? 'ph-arrow-down-right' : delta > 0 ? 'ph-arrow-up-right' : 'ph-minus'}`}></i>
                                {fmtDelta(delta)} kg dalla visita precedente
                            </>
                        )}
                    </p>
                </div>
                <div className="vd-tile">
                    <p className="vd-tile-label">BMI</p>
                    <p className="vd-tile-fig">{bmi === null ? '–' : fmt(bmi)}</p>
                    {band && (
                        <p className="vd-tile-note" style={{ '--tone': band.tone }}>
                            <span className="vd-dot"></span>
                            {band.label}
                        </p>
                    )}
                </div>
                <div className="vd-tile">
                    <p className="vd-tile-label">Altezza</p>
                    <p className="vd-tile-fig">
                        {has('altezza') ? fmt(d.altezza, 0) : '–'}
                        {has('altezza') && <small>cm</small>}
                    </p>
                </div>
            </div>

            {vitals.length > 0 && (
                <div className="vd-vitals">
                    {vitals.map((v) => (
                        <div key={v.label} className="vd-vital">
                            <i className={`ph ${v.icon}`}></i>
                            <div>
                                <p className="vd-tile-label">{v.label}</p>
                                <p className="vd-vital-val">
                                    {v.value}
                                    <small>{v.unit}</small>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {bloodCount > 0 && (
                <Section icon="ph-drop" title="Esami del sangue" count={bloodCount}>
                    {bloodShown.map((g) => (
                        <div key={g.id} className="vd-group">
                            <p className="vd-group-title">{g.title}</p>
                            <div className="vd-labs">
                                {g.keys.map((k) => (
                                    <BloodCell key={k} k={k} value={d[k]} sesso={sesso} />
                                ))}
                            </div>
                        </div>
                    ))}
                </Section>
            )}

            {measureShown.length > 0 && (
                <Section icon="ph-ruler" title="Misure corporee">
                    {measureShown.map((g) => (
                        <div key={g.id} className="vd-group">
                            <p className="vd-group-title">{g.title}</p>
                            <dl className="vd-rows">
                                {g.rows.map(([k, label]) => (
                                    <div key={k}>
                                        <dt>{label}</dt>
                                        <dd>
                                            {fmt(d[k], 2)}
                                            <small>{g.unit}</small>
                                        </dd>
                                    </div>
                                ))}
                                {g.id === 'circ' && whr !== null && (
                                    <div>
                                        <dt>Rapporto vita/fianchi</dt>
                                        <dd>{whr.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    ))}
                </Section>
            )}

            {(customMeasures.length > 0 || customFolds.length > 0) && (
                <Section icon="ph-sliders-horizontal" title="Misure personalizzate" count={customMeasures.length + customFolds.length}>
                    <dl className="vd-rows">
                        {[...customMeasures, ...customFolds].map((m) => (
                            <div key={m.id || m.nome}>
                                <dt>{m.nome || 'Senza nome'}</dt>
                                <dd>
                                    {fmt(m.valore, 2)}
                                    {m.unita && <small>{m.unita}</small>}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </Section>
            )}

            {lifestyle.length > 0 && (
                <Section icon="ph-moon-stars" title="Stile di vita">
                    <dl className="vd-rows is-wide">
                        {lifestyle.map(([k, label, unit]) => (
                            <div key={k}>
                                <dt>{label}</dt>
                                <dd className={String(d[k]).length > 28 ? 'is-text' : ''}>
                                    {fmt(d[k], 1)}
                                    {unit && <small>{unit}</small>}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </Section>
            )}

            {metodoA.length > 0 && (
                <Section icon="ph-chart-bar" title="Analisi metodo A">
                    <dl className="vd-rows">
                        {metodoA.map(([k, v]) => (
                            <div key={k}>
                                <dt>{prettyKey(k)}</dt>
                                <dd>{String(v)}</dd>
                            </div>
                        ))}
                    </dl>
                </Section>
            )}

            {extra.length > 0 && (
                <Section icon="ph-list-bullets" title="Altri dati">
                    <dl className="vd-rows">
                        {extra.map(([k, v]) => (
                            <div key={k}>
                                <dt>{prettyKey(k)}</dt>
                                <dd>{String(v)}</dd>
                            </div>
                        ))}
                    </dl>
                </Section>
            )}

            {texts.map(([k, title]) => (
                <Section key={k} icon="ph-clipboard-text" title={title}>
                    <p className="vd-text">{String(d[k])}</p>
                </Section>
            ))}

            {selectedVisit.note && !selectedVisit.note.includes('Solo Dieta') && (
                <Section icon="ph-note" title="Nota della visita">
                    <p className="vd-text">{selectedVisit.note}</p>
                </Section>
            )}
        </div>
    );
};
