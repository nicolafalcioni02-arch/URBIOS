import React from 'react';

export const PatientHeader = ({ onBack, patient, setView, status, view }) => {
    return (
        <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200 px-8 py-4 sticky top-0 z-30 flex flex-col md:flex-row justify-between items-center shadow-sm flex-none gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                >
                    <i className="ph ph-arrow-left text-xl"></i>
                </button>
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold ">
                            {patient.nome} {patient.cognome}
                        </h2>
                        <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border flex items-center gap-1 ${status === 'Attivo' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${status === 'Attivo' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            {status}
                        </span>
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID: #{patient.id}</span>
                </div>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-full overflow-x-auto max-w-full">
                {[
                    { id: 'info', label: 'Anagrafica', icon: 'ph-user' },
                    { id: 'history', label: 'Storico', icon: 'ph-clock-counter-clockwise' },
                    { id: 'visit', label: 'Nuova Visita', icon: 'ph-plus-circle' },
                    { id: 'Allenamento', label: 'Training', icon: 'ph-barbell' }, // Ho messo icona bilanciere
                    { id: 'diet', label: 'Diet', icon: 'ph-carrot' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id)}
                        className={`px-4 md:px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wide flex-row items-center flex items-center gap-2 transition-all whitespace-nowrap ${view === tab.id ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                        <i className={`ph ${tab.icon} text-lg`}></i> {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
