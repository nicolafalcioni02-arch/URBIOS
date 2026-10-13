import React, { useState } from 'react';
import { CASI_CLINICI_DEMO } from '../components/Pazienti_demo/casiDemo.js';
import { PatientDetail } from './patientDetail/PatientDetail';

export const StudentMode = ({ onExit, db }) => {
    const [selectedDemoId, setSelectedDemoId] = useState(null);

    // --- VISTA CASO SINGOLO ---
    if (selectedDemoId) {
        const demoPatient = CASI_CLINICI_DEMO.find((p) => p.id === selectedDemoId);
        return (
            <div className="student-mode relative h-full flex flex-col">
                <div className="flex-1 min-h-0">
                    <PatientDetail
                        patient={demoPatient}
                        onBack={() => setSelectedDemoId(null)}
                        onUpdateDb={() => {}} // NO-OP: nessuna modifica
                        db={{ ...db, pazienti: CASI_CLINICI_DEMO }}
                        readOnly={true}
                    />
                </div>
            </div>
        );
    }

    // --- LISTA CASI ---
    return (
        <div className="student-mode h-full w-full bg-[var(--paper)] flex flex-col items-center pt-8 relative font-sans overflow-y-auto fade-enter">
            <div className="w-full max-w-6xl px-4 sm:px-6 pb-20 pt-8">
                {/* HEADER */}
                <div className="flex flex-wrap justify-between items-end gap-4 mb-6 sm:mb-10">
                    <div>
                        <h1 className="font-semibold text-3xl sm:text-4xl text-zinc-900 tracking-tight">Training Mode</h1>
                        <p className="text-[color:var(--muted)] text-sm mt-1">Casi clinici dimostrativi</p>
                    </div>
                    <button
                        onClick={onExit}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:border-black hover:text-black transition-all shadow-sm"
                    >
                        <i className="ph-bold ph-arrow-left"></i>
                        Esci dalla modalità Student
                    </button>
                </div>

                {/* INFO BOX */}
                <div className="bg-white/70 border border-[color:var(--line)] rounded-2xl p-5 mb-8 flex items-start gap-4">
                    <div className="w-10 h-10 bg-[color:var(--soft)] rounded-full flex items-center justify-center shrink-0">
                        <i className="ph-fill ph-info text-[color:var(--ink)] text-xl"></i>
                    </div>
                    <div>
                        <p className="font-semibold text-[color:var(--ink)] text-sm mb-1">Come funziona la modalità Training</p>
                        <p className="text-[color:var(--muted)] text-[13px] leading-relaxed">
                            Esplora casi clinici realistici precaricati. Puoi navigare tra visite, piani dietetici e analisi esattamente come faresti con un
                            paziente reale. Nessuna modifica viene salvata: è un ambiente sicuro per imparare.
                        </p>
                    </div>
                </div>

                {/* GRIGLIA CASI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {CASI_CLINICI_DEMO.map((p) => {
                        const bmi = p.visite[0]?.dettagli?.altezza ? (p.visite[0].peso / Math.pow(p.visite[0].dettagli.altezza / 100, 2)).toFixed(1) : '-';
                        const age = p.dataNascita ? new Date().getFullYear() - new Date(p.dataNascita).getFullYear() : '-';

                        return (
                            <div
                                key={p.id}
                                onClick={() => setSelectedDemoId(p.id)}
                                className="bg-white rounded-2xl border border-gray-200 p-6 cursor-pointer hover:border-[color:var(--ink)] hover:-translate-y-0.5 hover:shadow-lg transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-full bg-[color:var(--soft)] text-[color:var(--ink)] flex items-center justify-center font-bold text-lg">
                                        {p.nome.charAt(0)}
                                        {p.cognome.charAt(0)}
                                    </div>
                                    <span className="text-[11px] font-semibold px-2 py-1 bg-[color:var(--soft)] text-[color:var(--muted)] border border-[color:var(--line)] rounded-full">
                                        Caso Demo
                                    </span>
                                </div>

                                <h3 className="font-black text-gray-900 text-lg mb-1">
                                    {p.nome} {p.cognome}
                                </h3>
                                <p className="text-xs text-gray-400 font-bold mb-4">
                                    {age} anni · {p.sesso === 'M' ? 'Uomo' : 'Donna'} · BMI {bmi}
                                </p>

                                <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{p.note}</p>

                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {p.patologie.map((pat) => (
                                        <span key={pat} className="text-[9px] font-bold px-2 py-0.5 bg-red-50 text-red-500 border border-red-100 rounded-full">
                                            {pat}
                                        </span>
                                    ))}
                                    {p.allergie.map((all) => (
                                        <span
                                            key={all}
                                            className="text-[9px] font-bold px-2 py-0.5 bg-orange-50 text-orange-500 border border-orange-100 rounded-full"
                                        >
                                            ⚠ {all}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <span className="text-xs font-bold text-gray-400">
                                        {p.visite.length} visit{p.visite.length !== 1 ? 'e' : 'a'}
                                    </span>
                                    <span className="text-sm font-semibold text-[color:var(--ink)] flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Esplora caso <i className="ph-bold ph-arrow-right"></i>
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
