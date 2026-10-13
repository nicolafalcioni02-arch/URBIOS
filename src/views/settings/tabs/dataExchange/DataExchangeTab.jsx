import React, { useState } from 'react';
import { ExportSection } from './ExportSection';
import { ImportSection } from './ImportSection';

// Impostazioni → "Importa & Esporta"
export const DataExchangeTab = ({ tab, db, onUpdateDb }) => {
    const [part, setPart] = useState('export');
    if (tab !== 'dati') return null;
    return (
        <div className="max-w-3xl mx-auto fade-enter pb-20">
            <h3 className="text-3xl font-[Helvetica] font-bold mb-1">Importa & Esporta</h3>
            <p className="text-sm text-gray-500 mb-5">
                Porta i dati dove ti servono (Excel, Word, ricerca) o unisci dati da altri file. Tutto resta sul tuo dispositivo.
            </p>
            <div className="inline-flex bg-gray-100 rounded-full p-1 mb-6">
                {[
                    ['export', 'Esporta'],
                    ['import', 'Importa'],
                ].map(([k, l]) => (
                    <button
                        key={k}
                        onClick={() => setPart(k)}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${part === k ? 'bg-black text-white shadow' : 'text-gray-600'}`}
                    >
                        {l}
                    </button>
                ))}
            </div>
            {part === 'export' ? <ExportSection db={db} /> : <ImportSection db={db} onUpdateDb={onUpdateDb} />}
        </div>
    );
};
