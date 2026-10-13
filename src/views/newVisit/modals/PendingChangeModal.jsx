import React from 'react';

export const PendingChangeModal = ({ confirmSettingsChange, db, pendingChange, sessoPaziente, setPendingChange }) => {
    return (
        pendingChange && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 fade-enter">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
                        <i className="ph-fill ph-warning text-2xl"></i>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">Modifica Riferimento Globale</h3>

                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        Hai modificato
                        {pendingChange.field === 'unit' ? (
                            <span> l'unità di misura </span>
                        ) : (
                            <span>
                                il range di riferimento per la popolazione
                                <strong className="text-gray-800"> {sessoPaziente === 'M' ? 'maschile' : 'femminile'}</strong>
                            </span>
                        )}{' '}
                        per <strong>{db.rangeEmato?.[pendingChange.key]?.label || pendingChange.key}</strong>.
                    </p>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex items-center justify-between">
                        <div className="text-center">
                            <span className="block text-[10px] font-bold uppercase text-gray-400">Attuale</span>
                            <span className="text-lg font-bold text-gray-500 line-through">{pendingChange.oldVal}</span>
                        </div>
                        <i className="ph-bold ph-arrow-right text-gray-300"></i>
                        <div className="text-center">
                            <span className="block text-[10px] font-bold uppercase text-blue-600">Nuovo</span>
                            <span className="text-xl font-bold text-blue-600">{pendingChange.newVal}</span>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-6 italic">
                        Sei sicuro di voler salvare le nuove impostazioni? Questo aggiornerà il database per tutti i pazienti futuri.
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setPendingChange(null)}
                            className="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                        >
                            Annulla
                        </button>
                        <button
                            onClick={confirmSettingsChange}
                            className="flex-1 px-4 py-2 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                        >
                            Salva Modifiche
                        </button>
                    </div>
                </div>
            </div>
        )
    );
};
