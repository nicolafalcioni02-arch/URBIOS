import React from 'react';

export const InfoTab = ({ tab }) => {
    return (
        tab === 'info' && (
            <div className="fade-enter text-center py-20">
                <h1 className="font-[Helvetica] tracking-[0.2em] font-bold text-6xl mb-2 text-slate-800"> URBIOS </h1>
                <p className="text-gray-500 font-medium">BioMed Professional Software</p>
                <div className="mt-10 p-6 bg-gray-50 rounded-xl max-w-md mx-auto text-xs text-gray-500">
                    Versione 1 <br />
                    Sviluppato da Nicola Falcioni <br />
                    © 2026 URBIOS Software <br />
                    Tutti i diritti riservati. <br />
                    <br />
                </div>
                <p className="mt-6 text-[11px] text-gray-400 max-w-md mx-auto leading-relaxed">
                    Figure degli esercizi: <em>free-exercise-db</em> (github.com/yuhonas/free-exercise-db), dataset di pubblico dominio (Unlicense).
                </p>
            </div>
        )
    );
};
