import React, { useState, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { SettingsModal } from './settings/SettingsModal';
import { PatientDetail } from './patientDetail/PatientDetail';
import { StudentMode } from './StudentMode';
import { useArchive } from '../storage/ArchiveProvider';

export const ProfessionalSuite = ({ data, onUpdateDb }) => {
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [studentMode, setStudentMode] = useState(false);
    const { dirty, ephemeral, saveFile, openExitDialog } = useArchive();

    const handleAddPatient = () => {
        const nome = prompt('Nome:');
        const cognome = prompt('Cognome:');
        if (nome && cognome) {
            const newP = {
                id: Math.random().toString().substr(2, 6),
                nome,
                cognome,
                sesso: 'M',
                dataNascita: '',
                status: 'Attivo',
                visite: [],
            };
            onUpdateDb((prev) => ({ ...prev, pazienti: [...prev.pazienti, newP] }));
        }
    };

    const handleSave = async () => {
        try {
            await saveFile();
        } catch (e) {
            alert('Salvataggio non riuscito: ' + (e.message || e));
        }
    };

    const selectedPatient = useMemo(() => data.pazienti.find((p) => p.id === selectedPatientId), [data.pazienti, selectedPatientId]);

    // --- ROUTING ---
    if (studentMode) {
        return <StudentMode onExit={() => setStudentMode(false)} db={data} />;
    }

    if (selectedPatientId && selectedPatient) {
        return <PatientDetail patient={selectedPatient} onBack={() => setSelectedPatientId(null)} onUpdateDb={onUpdateDb} db={data} />;
    }

    // --- SCHERMATA PRINCIPALE ---
    return (
        <div className="h-full w-full bg-[#f8f9fa] flex flex-col items-center pt-16 relative font-sans overflow-y-auto fade-enter">
            {showSettings && <SettingsModal db={data} onUpdateDb={onUpdateDb} onClose={() => setShowSettings(false)} />}

            <div className="w-full max-w-6xl px-6 pb-20">
                <div className="flex justify-between items-end mb-10">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="font-sans font-semibold text-4xl text-zinc-900 tracking-tight">URBIOS</h1>
                            <p className="text-gray-400 uppercase tracking-[0.2em] text-xs font-bold mt-1">SOFTWARE</p>
                        </div>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-black hover:border-black flex items-center justify-center transition-all shadow-sm mb-2"
                            title="Impostazioni & Formule"
                        >
                            <i className="ph-fill ph-gear text-xl"></i>
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setStudentMode(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-bold hover:bg-amber-100 transition-all"
                        >
                            <i className="ph-fill ph-student text-base"></i>
                            Modalità Student
                        </button>
                        <Button onClick={handleAddPatient} icon="ph-user-plus" className="whitespace-nowrap">
                            Nuovo Paziente
                        </Button>
                        {!ephemeral && (
                            <Button onClick={handleSave} variant="primary" icon="ph-floppy-disk">
                                {dirty ? 'Salva (modifiche non salvate)' : 'Salva archivio'}
                            </Button>
                        )}
                        <Button onClick={openExitDialog} icon="ph-sign-out" className="whitespace-nowrap">
                            Esci
                        </Button>
                    </div>
                </div>

                {/* LISTA PAZIENTI */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                        <div className="col-span-4">Paziente</div>
                        <div className="col-span-3">Ultima Attività</div>
                        <div className="col-span-3">Status</div>
                        <div className="col-span-2 text-right"></div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {data.pazienti.length > 0 ? (
                            data.pazienti.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPatientId(p.id)}
                                    className="grid grid-cols-12 p-5 items-center hover:bg-gray-50 cursor-pointer transition-colors group"
                                >
                                    <div className="col-span-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                                            {p.nome.charAt(0)}
                                            {p.cognome.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">
                                                {p.nome} {p.cognome}
                                            </div>
                                            <div className="text-xs text-gray-400">ID: {p.id}</div>
                                        </div>
                                    </div>
                                    <div className="col-span-3 text-sm text-gray-500">
                                        {p.visite.length ? new Date(p.visite[0].data).toLocaleDateString() : 'Nessuna visita'}
                                    </div>
                                    <div className="col-span-3">
                                        <span
                                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${p.status === 'Attivo' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                                        >
                                            {p.status || 'Attivo'}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-right">
                                        <i className="ph ph-caret-right text-gray-300 group-hover:text-black transition-colors"></i>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center text-gray-400">Nessun paziente presente. Inizia cliccando "Nuovo Paziente".</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
