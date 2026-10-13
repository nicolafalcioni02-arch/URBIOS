import React, { useState } from 'react';
import { CASI_CLINICI_DEMO } from '../components/Pazienti_demo/casiDemo.js';
import { PatientDetail } from './patientDetail/PatientDetail';

export const StudentMode = ({ onExit, db }) => {
    const [selectedDemoId, setSelectedDemoId] = useState(null);

    // --- VISTA CASO SINGOLO ---
    if (selectedDemoId) {
        const demoPatient = CASI_CLINICI_DEMO.find((p) => p.id === selectedDemoId);
        return (
            <div className="relative">
                {/* BANNER TRAINING */}
                <div className="fixed top-0 left-0 right-0 z-[99999] bg-amber-400 text-amber-900 text-center py-2 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3">
                    <i className="ph-fill ph-student text-base"></i>
                    MODALITÀ TRAINING — Caso clinico dimostrativo — Sola lettura
                    <button
                        onClick={() => setSelectedDemoId(null)}
                        className="ml-4 px-3 py-1 bg-amber-900/20 hover:bg-amber-900/30 rounded-full transition-colors"
                    >
                        ← Torna ai casi
                    </button>
                </div>
                <div className="pt-8">
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
        <div className="h-full w-full bg-[#f8f9fa] flex flex-col items-center pt-16 relative font-sans overflow-y-auto fade-enter">
            {/* BANNER */}
            <div className="fixed top-0 left-0 right-0 z-[99999] bg-amber-400 text-amber-900 text-center py-2 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <i className="ph-fill ph-student text-base"></i>
                MODALITÀ TRAINING ATTIVA — Nessuna modifica verrà salvata
            </div>

            <div className="w-full max-w-6xl px-6 pb-20 pt-8">
                {/* HEADER */}
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="font-semibold text-4xl text-zinc-900 tracking-tight">Training Mode</h1>
                        <p className="text-amber-500 uppercase tracking-[0.2em] text-xs font-bold mt-1">Casi Clinici Dimostrativi</p>
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
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                        <i className="ph-fill ph-info text-amber-600 text-xl"></i>
                    </div>
                    <div>
                        <p className="font-bold text-amber-900 text-sm mb-1">Come funziona la modalità Training</p>
                        <p className="text-amber-700 text-xs leading-relaxed">
                            Esplora casi clinici realistici precaricati. Puoi navigare tra visite, piani dietetici e analisi esattamente come faresti con un
                            paziente reale. Nessuna modifica viene salvata — è un ambiente sicuro per imparare.
                        </p>
                    </div>
                </div>

                {/* GRIGLIA CASI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {CASI_CLINICI_DEMO.map((p) => {
                        const bmi = p.visite[0]?.dettagli?.altezza ? (p.visite[0].peso / Math.pow(p.visite[0].dettagli.altezza / 100, 2)).toFixed(1) : '—';
                        const age = p.dataNascita ? new Date().getFullYear() - new Date(p.dataNascita).getFullYear() : '—';

                        return (
                            <div
                                key={p.id}
                                onClick={() => setSelectedDemoId(p.id)}
                                className="bg-white rounded-2xl border border-gray-200 p-6 cursor-pointer hover:border-amber-400 hover:shadow-lg transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg">
                                        {p.nome.charAt(0)}
                                        {p.cognome.charAt(0)}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full">
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
                                    <span className="text-xs font-bold text-amber-500 flex items-center gap-1 group-hover:gap-2 transition-all">
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
