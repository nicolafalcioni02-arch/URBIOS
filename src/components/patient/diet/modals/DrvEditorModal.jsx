import React from 'react';

export const DrvEditorModal = ({ drvDB, drvFileInputRef, drvSearch, isDrvEditorOpen, setDrvDB, setDrvSearch, setIsDrvEditorOpen }) => {
    return (
        isDrvEditorOpen &&
        (() => {
            // Filtro di ricerca in tempo reale
            const filteredDrv = drvDB.filter(
                (row) =>
                    !drvSearch ||
                    (row.Nutrient && row.Nutrient.toLowerCase().includes(drvSearch.toLowerCase())) ||
                    (row['Target population'] && row['Target population'].toLowerCase().includes(drvSearch.toLowerCase())) ||
                    (row.Gender && row.Gender.toLowerCase().includes(drvSearch.toLowerCase()))
            );

            return (
                <div className="fixed inset-0 z-[14000] flex items-center justify-center p-4 lg:p-6 bg-black/60 backdrop-blur-xl fade-enter">
                    <div className="bg-[#FAFAFC] rounded-[36px] shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-white/20">
                        {/* HEADER FLUTTUANTE */}
                        <div className="p-6 bg-white border-b border-gray-100 shrink-0 flex flex-col md:flex-row justify-between items-center gap-4 z-10 shadow-sm rounded-t-[36px]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 rounded-[18px] flex items-center justify-center shadow-inner border border-blue-200">
                                    <i className="ph-bold ph-database text-2xl drop-shadow-sm"></i>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Libreria DRV (EFSA)</h3>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                                        {drvDB.length} record nel database
                                    </span>
                                </div>
                            </div>

                            {/* BARRA DI RICERCA */}
                            <div className="relative w-full md:w-80 group">
                                <i className="ph-bold ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"></i>
                                <input
                                    type="text"
                                    placeholder="Cerca nutriente o popolazione..."
                                    value={drvSearch}
                                    onChange={(e) => setDrvSearch(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400 placeholder:font-medium"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => drvFileInputRef.current.click()}
                                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm group text-gray-700 hover:text-gray-900"
                                >
                                    <i className="ph-bold ph-upload-simple group-hover:text-blue-500 transition-colors text-lg"></i>{' '}
                                    <span className="hidden sm:block">Importa JSON</span>
                                </button>
                                <input
                                    type="file"
                                    ref={drvFileInputRef}
                                    accept=".json"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (evt) => {
                                                setDrvDB(JSON.parse(evt.target.result));
                                                alert('Database EFSA Caricato con successo!');
                                            };
                                            reader.readAsText(file);
                                        }
                                    }}
                                />

                                <button
                                    onClick={() => {
                                        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(drvDB, null, 2));
                                        const a = document.createElement('a');
                                        a.href = dataStr;
                                        a.download = 'drv_custom.json';
                                        a.click();
                                    }}
                                    className="px-4 py-2.5 bg-gray-900 text-white border border-gray-900 rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                                >
                                    <i className="ph-bold ph-download-simple text-lg"></i> <span className="hidden sm:block">Esporta DB</span>
                                </button>

                                <div className="w-px h-10 bg-gray-200 mx-2 hidden sm:block"></div>

                                <button
                                    onClick={() => {
                                        setIsDrvEditorOpen(false);
                                        setDrvSearch('');
                                    }}
                                    className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 flex items-center justify-center transition-colors"
                                >
                                    <i className="ph-bold ph-x text-lg"></i>
                                </button>
                            </div>
                        </div>

                        {/* TABELLA DATI IN LINEA */}
                        <div className="flex-1 overflow-auto p-6 bg-[#FAFAFC] custom-scrollbar">
                            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                                {filteredDrv.length === 0 ? (
                                    <div className="p-16 text-center flex flex-col items-center justify-center h-full">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                                            <i className="ph-thin ph-magnifying-glass text-4xl text-gray-400"></i>
                                        </div>
                                        <p className="font-bold text-gray-500 text-sm">
                                            Nessun record trovato {drvSearch ? `per "${drvSearch}"` : 'nel database'}.
                                        </p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100">
                                            <tr>
                                                <th className="p-4 font-black text-gray-400 uppercase tracking-widest text-[10px]">Nutriente</th>
                                                <th className="p-4 font-black text-gray-400 uppercase tracking-widest text-[10px]">Popolazione</th>
                                                <th className="p-4 font-black text-gray-400 uppercase tracking-widest text-[10px] text-center">Età / Genere</th>
                                                <th className="p-4 font-black text-green-500 uppercase tracking-widest text-[10px]">PRI / AR</th>
                                                <th className="p-4 font-black text-blue-500 uppercase tracking-widest text-[10px]">AI</th>
                                                <th className="p-4 font-black text-red-500 uppercase tracking-widest text-[10px]">UL (Max)</th>
                                                <th className="p-4 font-black text-gray-400 uppercase tracking-widest text-[10px] text-center w-16"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredDrv.map((row, idx) => {
                                                // Troviamo l'indice reale nel database originale per le modifiche
                                                const realIdx = drvDB.indexOf(row);
                                                return (
                                                    <tr key={realIdx} className="hover:bg-blue-50/20 transition-colors group">
                                                        <td className="p-2">
                                                            <input
                                                                className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg px-3 py-2 font-bold text-gray-900 outline-none transition-all truncate"
                                                                value={row.Nutrient || ''}
                                                                onChange={(e) => {
                                                                    const ndb = [...drvDB];
                                                                    ndb[realIdx].Nutrient = e.target.value;
                                                                    setDrvDB(ndb);
                                                                }}
                                                                title={row.Nutrient}
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                className="w-full bg-transparent border border-transparent hover:border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg px-3 py-2 font-medium text-gray-600 outline-none transition-all truncate"
                                                                value={row['Target population'] || ''}
                                                                onChange={(e) => {
                                                                    const ndb = [...drvDB];
                                                                    ndb[realIdx]['Target population'] = e.target.value;
                                                                    setDrvDB(ndb);
                                                                }}
                                                                title={row['Target population']}
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <div className="flex gap-1">
                                                                <input
                                                                    className="w-1/2 bg-transparent border border-transparent hover:border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg px-2 py-2 font-medium text-gray-600 outline-none transition-all text-center"
                                                                    value={row.Age || ''}
                                                                    onChange={(e) => {
                                                                        const ndb = [...drvDB];
                                                                        ndb[realIdx].Age = e.target.value;
                                                                        setDrvDB(ndb);
                                                                    }}
                                                                    placeholder="Age"
                                                                />
                                                                <span className="text-gray-300 self-center">/</span>
                                                                <input
                                                                    className="w-1/2 bg-transparent border border-transparent hover:border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg px-2 py-2 font-medium text-gray-600 outline-none transition-all text-center"
                                                                    value={row.Gender || ''}
                                                                    onChange={(e) => {
                                                                        const ndb = [...drvDB];
                                                                        ndb[realIdx].Gender = e.target.value;
                                                                        setDrvDB(ndb);
                                                                    }}
                                                                    placeholder="Gender"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="p-2 relative group/pri">
                                                            <input
                                                                className="w-full bg-transparent border border-transparent hover:border-green-200 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 rounded-lg px-3 py-2 font-black text-green-600 outline-none transition-all"
                                                                value={row.PRI || row.AR || ''}
                                                                onChange={(e) => {
                                                                    const ndb = [...drvDB];
                                                                    if (row.PRI !== undefined) ndb[realIdx].PRI = e.target.value;
                                                                    else ndb[realIdx].AR = e.target.value;
                                                                    setDrvDB(ndb);
                                                                }}
                                                                placeholder="ND"
                                                            />
                                                        </td>
                                                        <td className="p-2 relative group/ai">
                                                            <input
                                                                className="w-full bg-transparent border border-transparent hover:border-blue-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-lg px-3 py-2 font-black text-blue-600 outline-none transition-all"
                                                                value={row.AI || ''}
                                                                onChange={(e) => {
                                                                    const ndb = [...drvDB];
                                                                    ndb[realIdx].AI = e.target.value;
                                                                    setDrvDB(ndb);
                                                                }}
                                                                placeholder="ND"
                                                            />
                                                        </td>
                                                        <td className="p-2 relative group/ul">
                                                            <input
                                                                className="w-full bg-transparent border border-transparent hover:border-red-200 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 rounded-lg px-3 py-2 font-black text-red-500 outline-none transition-all"
                                                                value={row.UL || ''}
                                                                onChange={(e) => {
                                                                    const ndb = [...drvDB];
                                                                    ndb[realIdx].UL = e.target.value;
                                                                    setDrvDB(ndb);
                                                                }}
                                                                placeholder="ND"
                                                            />
                                                        </td>
                                                        <td className="p-2 text-center w-16">
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm('Eliminare definitivamente questo record?')) {
                                                                        const newDB = [...drvDB];
                                                                        newDB.splice(realIdx, 1);
                                                                        setDrvDB(newDB);
                                                                    }
                                                                }}
                                                                className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-bold transition-all shadow-sm opacity-0 group-hover:opacity-100 flex items-center justify-center mx-auto"
                                                            >
                                                                <i className="ph-bold ph-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* FOOTER PER AGGIUNTA MANUALE */}
                        <div className="p-4 bg-white border-t border-gray-100 flex justify-center z-10 shrink-0 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] rounded-b-[36px]">
                            <button
                                onClick={() => {
                                    setDrvDB([
                                        {
                                            Nutrient: 'Nuovo Nutriente',
                                            'Target population': 'Adults',
                                            Age: '18-39',
                                            Gender: 'All',
                                            PRI: '10 mg/day',
                                            AI: 'ND',
                                            UL: 'ND',
                                        },
                                        ...drvDB,
                                    ]);
                                    setDrvSearch('');
                                }}
                                className="px-6 py-3 border border-gray-200 bg-gray-50 text-gray-700 rounded-2xl text-xs font-bold hover:bg-white hover:border-gray-300 hover:shadow-md transition-all flex items-center gap-2 group"
                            >
                                <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-blue-300 group-hover:text-blue-500 transition-colors">
                                    <i className="ph-bold ph-plus"></i>
                                </div>
                                Crea Nuova Regola DRV Manuale
                            </button>
                        </div>
                    </div>
                </div>
            );
        })()
    );
};
