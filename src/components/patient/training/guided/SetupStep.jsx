import React, { useState } from 'react';
import { GOALS, LEVELS } from '../logic/science/guidelines';
import { goalById } from '../logic/science/guidelines';
import { isBlankPlan } from '../logic/trainingModel';
import { buildStructure, goalShort } from './trainingGuidedLogic';

// Passo 1 — Obiettivo: poche scelte in parole semplici. Se la scheda è vuota crea anche la struttura (settimane e sedute).

const Chip = ({ on, children, onClick, sub }) => (
    <button type="button" onClick={onClick} className={`dg-chip ${on ? 'on' : ''}`}>
        <span>{children}</span>
        {sub && <small>{sub}</small>}
    </button>
);

export const SetupStep = ({ header, setHeader, weeks, setWeeks, onDone }) => {
    const blank = isBlankPlan(weeks);
    const [sessions, setSessions] = useState(3);
    const [nWeeks, setNWeeks] = useState(4);
    const [deload, setDeload] = useState(true);
    const set = (patch) => setHeader({ ...header, ...patch });
    const goal = goalById(header.tipo);
    const ready = !!header.tipo && !!header.livello;

    // il livello suggerisce quante sedute: principiante 3, intermedio 4, avanzato 5
    const pickLevel = (id) => {
        set({ livello: id });
        if (blank) setSessions(id === 'principiante' ? 3 : id === 'intermedio' ? 4 : 5);
    };

    const confirm = () => {
        if (blank) setWeeks(buildStructure({ weeks: nWeeks, sessions, deload }));
        onDone();
    };

    return (
        <div className="max-w-3xl mx-auto dg-in">
            <section className="dg-card">
                <p className="dg-q">1 · Come si chiama la scheda?</p>
                <input className="fld" placeholder="Es. Mesociclo 1, Ipertrofia estate…" value={header.titolo} onChange={(e) => set({ titolo: e.target.value })} />
                <input className="fld mt-2" placeholder="Obiettivo con parole tue (facoltativo)" value={header.obiettivo} onChange={(e) => set({ obiettivo: e.target.value })} />
            </section>

            <section className="dg-card">
                <p className="dg-q">2 · Che tipo di obiettivo?</p>
                <div className="flex flex-wrap gap-2">
                    {GOALS.map((g) => (
                        <Chip key={g.id} on={header.tipo === g.id} sub={`${g.reps[0]}-${g.reps[1]} rip. · RPE ${g.rpe[0]}-${g.rpe[1]}`} onClick={() => set({ tipo: g.id })}>
                            {goalShort(g.id)}
                        </Chip>
                    ))}
                </div>
                {goal && (
                    <p className="dg-hint">
                        <b>{goal.label}:</b> {goal.reps[0]}-{goal.reps[1]} ripetizioni · {goal.pct[0]}-{goal.pct[1]}% del massimale · recupero {goal.rest[0]}-{goal.rest[1]} s. {goal.hint}
                    </p>
                )}
            </section>

            <section className="dg-card">
                <p className="dg-q">3 · Che livello ha?</p>
                <div className="flex flex-wrap gap-2">
                    {LEVELS.map((l) => (
                        <Chip key={l.id} on={header.livello === l.id} sub={l.sessions} onClick={() => pickLevel(l.id)}>
                            {l.label.split(' (')[0]} <span className="opacity-60">({l.label.split(' (')[1]?.replace(')', '')})</span>
                        </Chip>
                    ))}
                </div>
            </section>

            {blank ? (
                <section className="dg-card">
                    <p className="dg-q">4 · Quanto è lunga la scheda?</p>
                    <p className="text-[13px] text-[color:var(--muted)] mb-2">Sedute a settimana</p>
                    <div className="flex flex-wrap gap-2">
                        {[2, 3, 4, 5, 6].map((n) => (
                            <Chip key={n} on={sessions === n} onClick={() => setSessions(n)}>
                                {n}
                            </Chip>
                        ))}
                    </div>
                    <p className="text-[13px] text-[color:var(--muted)] mt-4 mb-2">Settimane</p>
                    <div className="flex flex-wrap gap-2">
                        {[1, 4, 6, 8].map((n) => (
                            <Chip key={n} on={nWeeks === n} onClick={() => setNWeeks(n)}>
                                {n === 1 ? '1 settimana' : `${n} settimane`}
                            </Chip>
                        ))}
                    </div>
                    {nWeeks >= 4 && (
                        <label className="flex items-center gap-2.5 mt-4 cursor-pointer text-[14px]">
                            <input type="checkbox" className="w-4 h-4" checked={deload} onChange={(e) => setDeload(e.target.checked)} />
                            Ultima settimana di scarico
                        </label>
                    )}
                    <p className="dg-hint">Poi compili la prima settimana e, se vuoi, il generatore di progressioni costruisce le altre.</p>
                </section>
            ) : null}

            <details className="dg-card dg-adv">
                <summary>
                    <span>
                        <i className="ph ph-sliders-horizontal"></i> Opzioni <small>facoltative</small>
                    </span>
                    <i className="ph ph-caret-down"></i>
                </summary>
                <label className="fld-label mt-3">Minuti extra per seduta (riscaldamento generale + defaticamento)</label>
                <input className="fld" style={{ maxWidth: 160 }} type="number" min="0" value={header.extraMin ?? 10} onChange={(e) => set({ extraMin: e.target.value })} />
                <p className="dg-hint">Serve a stimare la durata delle sedute.</p>
            </details>

            <div className="dg-foot">
                <button className="vw-next" disabled={!ready} onClick={confirm} style={!ready ? { opacity: 0.4, pointerEvents: 'none' } : undefined}>
                    {blank ? 'Crea la scheda' : 'Conferma e torna alla scheda'} <i className="ph ph-arrow-right"></i>
                </button>
            </div>
        </div>
    );
};
