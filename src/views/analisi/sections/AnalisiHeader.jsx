import React from 'react';

export const AnalisiHeader = ({ onClose, patient }) => {
    return (
        <div className="px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-200 flex justify-between items-center bg-white z-10 shadow-sm">
            <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-semibold text-gray-900 tracking-tight">Analisi Clinica Avanzata</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <p className="text-xs text-gray-500 font-bold ">
                        {patient.nome} {patient.cognome}
                    </p>
                </div>
            </div>
            <button
                onClick={onClose}
                className="w-10 h-10 flex-none rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-300 flex items-center justify-center transition-all active:scale-90"
            >
                <i className="ph-bold ph-x text-lg text-gray-700"></i>
            </button>
        </div>
    );
};
