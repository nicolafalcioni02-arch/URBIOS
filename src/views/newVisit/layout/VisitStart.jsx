import React from 'react';
import { VISIT_MODES } from '../data/visitSections';

const byId = (id) => VISIT_MODES.find((m) => m.id === id);

// Prima schermata di Nuova Visita: la scelta decide il percorso. Gerarchia: la visita completa e' la strada principale,
// il controllo e' la seconda, i piani da soli sono scorciatoie.
export const VisitStart = ({ patient, onPick }) => {
    const nVisite = patient?.visite?.length || 0;
    const last = patient?.visite?.[0]?.data;
    const completa = byId('completa');
    const controllo = byId('controllo');
    const piani = [byId('dieta'), byId('training')];

    return (
        <div className="max-w-3xl mx-auto w-full px-4 md:px-8 pt-6 md:pt-10 pb-10">
            <div className="rise mb-6">
                <h2 className="text-[28px] sm:text-[34px] leading-[1.1] font-bold tracking-tight text-[color:var(--ink)]">Che visita è?</h2>
                <p className="text-[14px] text-[color:var(--muted)] mt-1.5">
                    {nVisite ? `${patient.nome} ha ${nVisite} ${nVisite === 1 ? 'visita' : 'visite'} in archivio, l'ultima il ${last}.` : `${patient.nome} non ha ancora visite: si parte da quella completa.`}
                </p>
            </div>

            <button onClick={() => onPick(completa)} className="vs-hero text-left w-full">
                <span className="vs-hero-icon">
                    <i className={`ph ${completa.icon}`}></i>
                </span>
                <span className="flex-1 min-w-0">
                    <span className="block font-semibold text-[19px]">{completa.title}</span>
                    <span className="block text-[13.5px] opacity-70 mt-1">{completa.desc}</span>
                </span>
                <i className="ph ph-arrow-right text-[22px] opacity-80"></i>
            </button>

            <button disabled={!nVisite} onClick={() => onPick(controllo)} className="vs-card vs-mid text-left w-full mt-3">
                <span className="vs-card-icon">
                    <i className={`ph ${controllo.icon}`}></i>
                </span>
                <span className="flex-1 min-w-0">
                    <span className="block font-semibold text-[16px] text-[color:var(--ink)]">{controllo.title}</span>
                    <span className="block text-[13px] text-[color:var(--muted)] mt-0.5">{nVisite ? controllo.desc : 'Serve almeno una visita salvata.'}</span>
                </span>
                <i className="ph ph-arrow-right text-[18px] text-[color:var(--muted)]"></i>
            </button>

            <p className="text-[12px] font-semibold uppercase tracking-wider text-[color:var(--muted)] mt-8 mb-2.5">Solo i piani, senza nuova visita</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
                {piani.map((m) => (
                    <button key={m.id} disabled={!nVisite} onClick={() => onPick(m)} className="vs-row text-left">
                        <i className={`ph ${m.icon} text-[18px]`}></i>
                        <span className="font-medium text-[14.5px] text-[color:var(--ink)]">{m.title.replace('Solo ', '').replace(/^./, (c) => c.toUpperCase())}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
