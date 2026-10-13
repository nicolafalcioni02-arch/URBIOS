import React from 'react';

export const MealLibraryModal = ({ isLibraryOpen, libFilter, loadFromLibrary, mealLibrary, setIsLibraryOpen, setLibFilter, setMealLibrary }) => {
    return (
        isLibraryOpen &&
        (() => {
            // 1. Estrae i titoli univoci (rimuove i doppioni)
            const uniqueTitles = ['Tutti', ...new Set(mealLibrary.map((m) => m.title).filter(Boolean))];

            // 2. Filtra la libreria in base al bottone cliccato
            const filteredLibrary = libFilter === 'Tutti' ? mealLibrary : mealLibrary.filter((m) => m.title === libFilter);

            return (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden fade-enter border border-gray-100">
                        {/* HEADER LIBRERIA */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-800">
                                    <i className="ph-bold ph-books text-2xl"></i>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 leading-tight">Libreria Pasti</h3>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{mealLibrary.length} modelli salvati</span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setIsLibraryOpen(false);
                                    setLibFilter('Tutti');
                                }}
                                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors flex items-center justify-center"
                            >
                                <i className="ph-bold ph-x text-lg"></i>
                            </button>
                        </div>

                        {/* BARRA DEI FILTRI SCROLLABILE (Novità) */}
                        {mealLibrary.length > 0 && (
                            <div className="px-6 py-4 bg-white border-b border-gray-100 flex gap-2 overflow-x-auto shrink-0 custom-scrollbar shadow-sm z-10">
                                {uniqueTitles.map((title, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setLibFilter(title)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                            libFilter === title
                                                ? 'bg-black text-white shadow-md transform scale-105'
                                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                                        }`}
                                    >
                                        {title}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* BODY LIBRERIA / GRIGLIA CARD */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                            {filteredLibrary.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                                    <i className="ph-thin ph-magnifying-glass text-6xl mb-4 text-gray-300"></i>
                                    <p className="font-bold text-sm">Nessun pasto trovato per "{libFilter}".</p>
                                    <button onClick={() => setLibFilter('Tutti')} className="mt-4 text-blue-500 font-bold text-xs hover:underline">
                                        Torna a Tutti i pasti
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {filteredLibrary.map((libMeal) => (
                                        <div
                                            key={libMeal.id}
                                            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col"
                                        >
                                            {/* Titolo e Data */}
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="font-black text-gray-800 text-base leading-tight pr-2">{libMeal.title}</h4>
                                                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md shrink-0">
                                                    {libMeal.savedAt}
                                                </span>
                                            </div>

                                            {/* LISTA ALIMENTI */}
                                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4 flex-1">
                                                <span className="block text-[9px] font-bold uppercase text-gray-400 mb-2">
                                                    Composizione ({libMeal.items?.length || 0})
                                                </span>
                                                <div className="max-h-28 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                    {libMeal.items?.map((it, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100 text-xs font-bold"
                                                        >
                                                            <span className="text-gray-700 truncate mr-2">{it.name || 'Alimento'}</span>
                                                            <span className="text-green-600 shrink-0">{it.weight}g</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* RIASSUNTO MACRO IN LINEA */}
                                            <div className="flex justify-between items-center py-3 border-y border-gray-100 mb-4">
                                                <div className="text-center">
                                                    <span className="block text-[9px] font-bold uppercase text-gray-400">KCAL</span>
                                                    <span className="text-sm font-black text-gray-800">{Math.round(libMeal.totals?.kcal || 0)}</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="block text-[9px] font-bold uppercase text-gray-400">PRO</span>
                                                    <span className="text-sm font-black text-green-600">{libMeal.totals?.p?.toFixed(0) || 0}g</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="block text-[9px] font-bold uppercase text-gray-400">CAR</span>
                                                    <span className="text-sm font-black text-gray-800">{libMeal.totals?.c?.toFixed(0) || 0}g</span>
                                                </div>
                                                <div className="text-center">
                                                    <span className="block text-[9px] font-bold uppercase text-gray-400">FAT</span>
                                                    <span className="text-sm font-black text-gray-800">{libMeal.totals?.f?.toFixed(0) || 0}g</span>
                                                </div>
                                            </div>

                                            {/* NOTE (se presenti) */}
                                            {libMeal.note && (
                                                <p className="text-xs text-gray-600 italic mb-4 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50 leading-relaxed">
                                                    <i className="ph-fill ph-info mr-1.5 text-amber-500"></i>
                                                    {libMeal.note}
                                                </p>
                                            )}

                                            {/* TASTI AZIONE */}
                                            <div className="flex gap-2 mt-auto">
                                                <button
                                                    onClick={() => {
                                                        loadFromLibrary(libMeal);
                                                        setLibFilter('Tutti');
                                                    }}
                                                    className="flex-1 bg-black text-white px-4 py-3 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex justify-center items-center gap-2 shadow-lg shadow-gray-200"
                                                >
                                                    <i className="ph-bold ph-download-simple text-sm"></i> Importa nel piano
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setMealLibrary((prev) => prev.filter((m) => m.id !== libMeal.id));
                                                        // Se eliminiamo l'ultimo pasto di questa categoria, torniamo a "Tutti"
                                                        const isLastOfKind = filteredLibrary.length === 1;
                                                        if (isLastOfKind) setLibFilter('Tutti');
                                                    }}
                                                    className="px-4 py-3 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex justify-center items-center"
                                                    title="Elimina modello"
                                                >
                                                    <i className="ph-bold ph-trash text-sm"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        })()
    );
};
