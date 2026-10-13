import React from 'react';
import { SECTIONS } from '../data/visitSections';

export const VisitHeaderBar = ({ activeSection, handleFinalizeVisit, handleNavClick, setShowAnalisi, setShowReport }) => {
    return (
        <div className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm sticky top-0 z-30 mb-8 transition-all">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Nuova Valutazione</h3>
                    <p className="text-xs text-gray-500">Compila i dati per generare il report.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowAnalisi(true)}
                        className="group relative px-6 py-2 rounded-full overflow-hidden shadow-sm hover:shadow-indigo-300/50 hover:shadow-lg transition-all duration-300 border border-gray-200 active:scale-95"
                    >
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] group-hover:bg-white/10 transition-colors duration-300"></div>
                        <div className="relative z-10 flex items-center gap-2">
                            <i className="ph-fill ph-sparkle text-indigo-900 text-lg group-hover:rotate-12 transition-transform duration-300"></i>
                            <span className="text-xs font-black uppercase tracking-[0.15em] text-indigo-950 group-hover:text-black transition-colors">
                                Analisi
                            </span>
                        </div>
                    </button>

                    <button
                        onClick={() => setShowReport(true)}
                        className="bg-white border border-gray-200 text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-all flex-row items-center flex items-center gap-2"
                    >
                        <i className="ph ph-printer text-lg"></i> <span className="hidden md:inline">Stampa</span>
                    </button>
                    <button
                        onClick={handleFinalizeVisit}
                        className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition-all flex-row items-center flex items-center gap-2"
                    >
                        <i className="ph ph-floppy-disk text-lg"></i> <span className="hidden md:inline">Salva</span>
                    </button>
                </div>
            </div>

            {/* Navigatore */}
            <div className="flex items-center gap-1 p-2 overflow-x-auto no-scrollbar">
                {SECTIONS.map((sec) => (
                    <button
                        key={sec.id}
                        onClick={() => handleNavClick(sec.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs flex-row items-center font-bold whitespace-nowrap transition-all duration-400 ${activeSection === sec.id ? 'bg-black text-white shadow-md transform scale-105' : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-black'}`}
                    >
                        <i className={`ph ${sec.icon} text-lg ${activeSection === sec.id ? 'text-blue-400' : ''}`}></i> {sec.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
