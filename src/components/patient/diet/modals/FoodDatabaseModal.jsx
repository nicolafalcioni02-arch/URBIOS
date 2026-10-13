import React from 'react';

export const FoodDatabaseModal = ({
    dbSearch,
    deleteFoodDB,
    editingFood,
    editorTab,
    emptyFoodTemplate,
    exportJSON,
    fileInputRef,
    foodDB,
    handleSaveEditedFood,
    importJSON,
    isDbOpen,
    setDbSearch,
    setEditingFood,
    setEditorTab,
    setIsDbOpen,
}) => {
    return (
        isDbOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col h-[90vh] overflow-hidden fade-enter border border-gray-100">
                    {/* HEADER */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-800">
                                <i className="ph-bold ph-database text-2xl"></i>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 leading-tight">Database Nutrizionale CREA</h3>
                                <span className="text-xs font-bold text-gray-400 ">{foodDB.length} alimenti in memoria</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setIsDbOpen(false);
                                setEditingFood(null);
                            }}
                            className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors flex items-center justify-center"
                        >
                            <i className="ph-bold ph-x text-lg"></i>
                        </button>
                    </div>

                    {/* --- VISTA 1: LISTA ALIMENTI --- */}
                    {!editingFood && (
                        <div className="flex flex-col flex-1 overflow-hidden bg-gray-50/50">
                            {/* BARRA AZIONI (Ricerca, Aggiungi, Import/Export) */}
                            <div className="p-4 bg-white border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between shrink-0">
                                <div className="relative flex-1 min-w-[250px]">
                                    <i className="ph-bold ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                                    <input
                                        type="text"
                                        placeholder="Cerca alimento o categoria..."
                                        value={dbSearch}
                                        onChange={(e) => setDbSearch(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-800 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all bg-gray-50 focus:bg-white"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    >
                                        <i className="ph-bold ph-upload-simple"></i> Importa JSON
                                    </button>
                                    <input type="file" ref={fileInputRef} accept=".json" style={{ display: 'none' }} onChange={importJSON} />

                                    <button
                                        onClick={exportJSON}
                                        className="px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    >
                                        <i className="ph-bold ph-download-simple"></i> Esporta JSON
                                    </button>

                                    <button
                                        onClick={() => setEditingFood({ ...emptyFoodTemplate })}
                                        className="px-5 py-3 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg shadow-gray-200 ml-2"
                                    >
                                        <i className="ph-bold ph-plus"></i> Nuovo Alimento
                                    </button>
                                </div>
                            </div>

                            {/* TABELLA DATI */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                                            <tr>
                                                <th className="p-4 text-xs font-semibold text-gray-400 ">Alimento</th>
                                                <th className="p-4 text-xs font-semibold text-gray-400 ">Categoria</th>
                                                <th className="p-4 text-xs font-semibold text-gray-400 text-center">Kcal</th>
                                                <th className="p-4 text-xs font-semibold text-gray-400 text-center text-green-600">
                                                    Pro
                                                </th>
                                                <th className="p-4 text-xs font-semibold text-gray-400 text-center">Car</th>
                                                <th className="p-4 text-xs font-semibold text-gray-400 text-center">Fat</th>
                                                <th className="p-4 text-xs font-semibold text-gray-400 text-center">Azioni</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {foodDB
                                                .filter(
                                                    (f) =>
                                                        !dbSearch ||
                                                        f.name.toLowerCase().includes(dbSearch.toLowerCase()) ||
                                                        f.category.toLowerCase().includes(dbSearch.toLowerCase())
                                                )
                                                .map((f, index) => (
                                                    <tr key={index} className="hover:bg-gray-50 transition-colors group">
                                                        <td className="p-4">
                                                            <div className="font-bold text-sm text-gray-900">{f.name}</div>
                                                            {f.scientific_name && <div className="text-[10px] text-gray-400 italic">{f.scientific_name}</div>}
                                                        </td>
                                                        <td className="p-4 text-xs font-bold text-gray-500">{f.category}</td>
                                                        <td className="p-4 text-sm font-black text-gray-800 text-center">{f.energy_kcal || f.kcal || 0}</td>
                                                        <td className="p-4 text-sm font-black text-green-600 text-center">{f.proteins || f.p || 0}</td>
                                                        <td className="p-4 text-sm font-black text-gray-800 text-center">
                                                            {f.available_carbohydrates || f.c || 0}
                                                        </td>
                                                        <td className="p-4 text-sm font-black text-gray-800 text-center">{f.lipids || f.f || 0}</td>
                                                        <td className="p-4 text-center">
                                                            <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => setEditingFood({ ...f, _editIndex: foodDB.indexOf(f) })}
                                                                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-600 flex items-center justify-center transition-colors"
                                                                >
                                                                    <i className="ph-bold ph-pencil-simple"></i>
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteFoodDB(foodDB.indexOf(f))}
                                                                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                                                                >
                                                                    <i className="ph-bold ph-trash"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- VISTA 2: EDITOR AVANZATO (80+ CAMPI) --- */}
                    {editingFood && (
                        <div className="flex flex-col flex-1 overflow-hidden bg-gray-50">
                            {/* Header Editor */}
                            <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setEditingFood(null)}
                                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors mr-2"
                                    >
                                        <i className="ph-bold ph-arrow-left"></i>
                                    </button>
                                    <h4 className="font-black text-lg text-gray-900">
                                        {editingFood._editIndex !== undefined ? 'Modifica Alimento' : 'Nuovo Alimento'}
                                    </h4>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveEditedFood}
                                        className="px-5 py-2.5 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors shadow-lg shadow-green-200 flex items-center gap-2"
                                    >
                                        <i className="ph-bold ph-floppy-disk"></i> Salva nel Database
                                    </button>
                                </div>
                            </div>

                            {/* Tabs Navigazione Editor */}
                            <div className="px-6 pt-4 bg-white border-b border-gray-100 flex gap-2 overflow-x-auto shrink-0 custom-scrollbar">
                                {[
                                    { id: 'base', icon: 'ph-info', label: 'Info Base' },
                                    { id: 'macro', icon: 'ph-chart-pie-slice', label: 'Macro & Energia' },
                                    { id: 'micro', icon: 'ph-drop', label: 'Vitamine & Minerali' },
                                    { id: 'grassi', icon: 'ph-flask', label: 'Acidi Grassi' },
                                    { id: 'amino', icon: 'ph-dna', label: 'Aminoacidi' },
                                    { id: 'altro', icon: 'ph-leaf', label: 'Altri Composti' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setEditorTab(tab.id)}
                                        className={`px-4 py-3 rounded-t-xl text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${editorTab === tab.id ? 'border-black text-black bg-gray-50/50' : 'border-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                                    >
                                        <i className={`ph-bold ${tab.icon} text-lg`}></i> {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Form Dinamico a Griglia */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {editorTab === 'base' && (
                                        <>
                                            {['name', 'category', 'food_code', 'scientific_name', 'english_name'].map((key) => (
                                                <div key={key}>
                                                    <label className="block text-xs font-bold text-gray-400 mb-1">{key.replace(/_/g, ' ')}</label>
                                                    <input
                                                        type="text"
                                                        value={editingFood[key] || ''}
                                                        onChange={(e) => setEditingFood({ ...editingFood, [key]: e.target.value })}
                                                        className="w-full p-3 rounded-xl border border-gray-200 text-sm font-bold focus:border-green-500 outline-none"
                                                    />
                                                </div>
                                            ))}
                                            {['portion', 'edible_part'].map((key) => (
                                                <div key={key}>
                                                    <label className="block text-xs font-bold text-gray-400 mb-1">{key.replace(/_/g, ' ')}</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={editingFood[key] || 0}
                                                        onChange={(e) => setEditingFood({ ...editingFood, [key]: Number(e.target.value) })}
                                                        className="w-full p-3 rounded-xl border border-gray-200 text-sm font-bold focus:border-green-500 outline-none bg-gray-50"
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {editorTab === 'macro' && (
                                        <>
                                            <div className="md:col-span-3 pb-2 border-b border-gray-200 mb-2 font-black text-gray-800">Primari</div>
                                            {[
                                                'energy_kcal',
                                                'energy_kj',
                                                'water',
                                                'proteins',
                                                'lipids',
                                                'available_carbohydrates',
                                                'total_fiber',
                                                'cholesterol',
                                                'alcohol',
                                            ].map((key) => (
                                                <div key={key}>
                                                    <label className="block text-xs font-bold text-gray-400 mb-1">{key.replace(/_/g, ' ')}</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={editingFood[key] || 0}
                                                        onChange={(e) => setEditingFood({ ...editingFood, [key]: Number(e.target.value) })}
                                                        className="w-full p-3 rounded-xl border border-gray-200 text-sm font-bold focus:border-green-500 outline-none"
                                                    />
                                                </div>
                                            ))}
                                            <div className="md:col-span-3 pt-4 pb-2 border-b border-gray-200 mb-2 font-black text-gray-800 mt-4">
                                                Carboidrati e Fibre (Dettaglio)
                                            </div>
                                            {[
                                                'starch',
                                                'soluble_sugars',
                                                'sucrose',
                                                'glucose',
                                                'fructose',
                                                'lactose',
                                                'galactose',
                                                'maltose',
                                                'soluble_fiber',
                                                'insoluble_fiber',
                                            ].map((key) => (
                                                <div key={key}>
                                                    <label className="block text-xs font-bold text-gray-400 mb-1">{key.replace(/_/g, ' ')}</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={editingFood[key] || 0}
                                                        onChange={(e) => setEditingFood({ ...editingFood, [key]: Number(e.target.value) })}
                                                        className="w-full p-3 rounded-xl border border-gray-200 text-sm font-bold focus:border-green-500 outline-none"
                                                    />
                                                </div>
                                            ))}
                                        </>
                                    )}

                                    {/* PER BREVITÀ DEL CODICE: Generatore automatico per gli altri TAB */}
                                    {editorTab === 'micro' &&
                                        [
                                            'sodium',
                                            'potassium',
                                            'calcium',
                                            'magnesium',
                                            'phosphorus',
                                            'iron',
                                            'copper',
                                            'zinc',
                                            'selenium',
                                            'iodine',
                                            'vitamin_a_retinol_equivalent',
                                            'retinol',
                                            'beta_carotene',
                                            'thiamine',
                                            'riboflavin',
                                            'niacin',
                                            'vitamin_c',
                                            'vitamin_d',
                                            'vitamin_e',
                                            'folate',
                                            'vitamin_b12',
                                            'vitamin_k',
                                        ].map((key) => (
                                            <div key={key}>
                                                <label className="block text-xs font-bold text-gray-400 mb-1">{key.replace(/_/g, ' ')}</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editingFood[key] || 0}
                                                    onChange={(e) => setEditingFood({ ...editingFood, [key]: Number(e.target.value) })}
                                                    className="w-full p-3 rounded-xl border border-gray-200 text-sm font-bold focus:border-green-500 outline-none"
                                                />
                                            </div>
                                        ))}

                                    {editorTab === 'grassi' &&
                                        [
                                            'Saturated_fatty_acids',
                                            'monounsaturated_fatty_acids',
                                            'polyunsaturated_fatty_acids',
                                            'C16:0_palmitic_acid',
                                            'C18:0_stearic_acid',
                                            'C18:1_oleic_acid',
                                            'C18:2_linoleic_acid',
                                            'C18:3_linolenic_acid',
                                            'C20:4_arachidonic_acid',
                                            'C20:5_eicosapentaenoic_acid_EPA',
                                            'C22:6_docosahexaenoic_acid_DHA',
                                        ].map((key) => (
                                            <div key={key}>
                                                <label className="block text-xs font-bold text-gray-400 mb-1 truncate" title={key}>
                                                    {key.replace(/_/g, ' ')}
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editingFood[key] || 0}
                                                    onChange={(e) => setEditingFood({ ...editingFood, [key]: Number(e.target.value) })}
                                                    className="w-full p-3 rounded-xl border border-gray-200 text-sm font-bold focus:border-green-500 outline-none"
                                                />
                                            </div>
                                        ))}

                                    {editorTab === 'amino' &&
                                        [
                                            'alanine',
                                            'arginine',
                                            'aspartic_acid',
                                            'cystine',
                                            'glutamic_acid',
                                            'glycine',
                                            'histidine',
                                            'isoleucine',
                                            'leucine',
                                            'lysine',
                                            'methionine',
                                            'phenylalanine',
                                            'proline',
                                            'serine',
                                            'threonine',
                                            'tryptophan',
                                            'tyrosine',
                                            'valine',
                                            'chemical_index',
                                        ].map((key) => (
                                            <div key={key}>
                                                <label className="block text-xs font-bold text-gray-400 mb-1 truncate">
                                                    {key.replace(/_/g, ' ')}
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editingFood[key] || 0}
                                                    onChange={(e) => setEditingFood({ ...editingFood, [key]: Number(e.target.value) })}
                                                    className="w-full p-3 rounded-xl border border-gray-200 text-sm font-bold focus:border-green-500 outline-none"
                                                />
                                            </div>
                                        ))}

                                    {editorTab === 'altro' &&
                                        [
                                            'caffeic_acid',
                                            'citric_acid',
                                            'phytic_acid',
                                            'malic_acid',
                                            'apigenin',
                                            'antioxidant_activity',
                                            'campferol',
                                            'phytosterols',
                                            'fructo-oligosaccharides',
                                            'myricetin',
                                            'polyphenols',
                                            'quercetin',
                                        ].map((key) => (
                                            <div key={key}>
                                                <label className="block text-xs font-bold text-gray-400 mb-1 truncate">
                                                    {key.replace(/_/g, ' ')}
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editingFood[key] || 0}
                                                    onChange={(e) => setEditingFood({ ...editingFood, [key]: Number(e.target.value) })}
                                                    className="w-full p-3 rounded-xl border border-gray-200 text-sm font-bold focus:border-green-500 outline-none"
                                                />
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    );
};
