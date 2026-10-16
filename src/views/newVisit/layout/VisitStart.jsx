import React from 'react';
import { SECTIONS, VISIT_MODES } from '../data/visitSections';

const byId = (id) => VISIT_MODES.find((m) => m.id === id);
const stepName = (id) => (SECTIONS.find((s) => s.id === id) || {}).short || id;
const PLAN_NAME = { dieta: 'Dieta', training: 'Allenamento' };

// la luce sul vetro segue il puntatore (sul touch resta ferma)
const followLight = (e) => {
    if (e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
};

// Una delle due strade principali: la consigliata è in vetro liquido, l'altra è chiara
const Path = ({ mode, hero, disabled, note, onPick, delay }) => {
    const steps = mode.rilievi.length + mode.plans.length;
    return (
        <button disabled={disabled} onClick={() => onPick(mode)} onPointerMove={hero ? followLight : undefined} className={`st-path rise ${hero ? 'is-hero' : ''}`} style={{ animationDelay: delay }}>
            <span className="st-in">
                <span className="st-top">
                    <span className="st-ico">
                        <i className={`ph-bold ${mode.icon}`}></i>
                    </span>
                    {note && <span className="st-note">{note}</span>}
                </span>
                <span className="st-title">{mode.title}</span>
                <span className="st-desc">{mode.desc}</span>
                <span className="st-chips">
                    {mode.rilievi.map((id) => (
                        <span key={id}>{stepName(id)}</span>
                    ))}
                    {mode.plans.map((id) => (
                        <span key={id} className="is-plan">
                            {PLAN_NAME[id]}
                        </span>
                    ))}
                </span>
                <span className="st-foot">
                    <span>{steps} passi</span>
                    <span className="st-go">
                        <i className="ph-bold ph-arrow-right"></i>
                    </span>
                </span>
            </span>
        </button>
    );
};

// Prima schermata di Nuova Visita: la scelta decide il percorso. La strada consigliata cambia con la storia del paziente:
// senza visite si parte da quella completa, con visite in archivio il controllo è il caso più comune.
export const VisitStart = ({ patient, onPick }) => {
    const nVisite = patient?.visite?.length || 0;
    const last = [...(patient?.visite || [])].sort((a, b) => new Date(b.data) - new Date(a.data))[0];
    const lastLabel = last ? new Date(last.data).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
    const completa = byId('completa');
    const controllo = byId('controllo');
    const piani = [byId('dieta'), byId('training')];
    const suggestControl = nVisite > 0;

    return (
        <div className="st-wrap">
            <div className="rise st-head">
                <h2>Che visita è?</h2>
                <p>
                    {nVisite
                        ? `${patient.nome} ha ${nVisite} ${nVisite === 1 ? 'visita' : 'visite'} in archivio, l'ultima il ${lastLabel}.`
                        : `${patient.nome} non ha ancora visite: si parte da quella completa.`}
                </p>
            </div>

            <div className="st-paths">
                <Path mode={suggestControl ? controllo : completa} hero note="Consigliata" onPick={onPick} delay=".05s" />
                <Path
                    mode={suggestControl ? completa : controllo}
                    disabled={!suggestControl && !nVisite}
                    note={!suggestControl ? 'Serve una visita salvata' : null}
                    onPick={onPick}
                    delay=".12s"
                />
            </div>

            <div className="st-plans rise" style={{ animationDelay: '.2s' }}>
                <div className="st-plans-head">
                    <h3>Solo i piani</h3>
                    <p>Senza registrare una nuova visita.</p>
                </div>
                <div className="st-plans-row">
                    {piani.map((m) => (
                        <button key={m.id} disabled={!nVisite} onClick={() => onPick(m)} className="st-plan">
                            <span className="st-ico is-sm">
                                <i className={`ph-bold ${m.icon}`}></i>
                            </span>
                            <span className="min-w-0 flex-1 text-left">
                                <b>{m.title.replace('Solo ', '').replace(/^./, (c) => c.toUpperCase())}</b>
                                <small>{nVisite ? m.desc : 'Serve almeno una visita salvata.'}</small>
                            </span>
                            <i className="ph ph-arrow-right"></i>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
