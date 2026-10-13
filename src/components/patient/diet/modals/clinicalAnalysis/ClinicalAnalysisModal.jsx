import React from 'react';
import { GlossaryPanel } from './parts/GlossaryPanel';
import { MinorComponentsAccordion } from './parts/MinorComponentsAccordion';
import { NutrientTargetsGrid } from './parts/NutrientTargetsGrid';

export const ClinicalAnalysisModal = ({
    analysisTimeframe,
    analyzeCompleteBioProfile,
    dietDays,
    getPatientTargets,
    isAnalysisOpen,
    patientProfile,
    setAnalysisTimeframe,
    setIsAnalysisOpen,
    setIsDrvEditorOpen,
    setShowGlossary,
    showGlossary,
}) => {
    return (
        isAnalysisOpen &&
        (() => {
            const patientTargets = getPatientTargets();
            const profileResult = analyzeCompleteBioProfile(dietDays);
            const currentProfile = profileResult.data || profileResult;

            let multiplier = 1;
            if (analysisTimeframe === 'week') multiplier = 7;
            if (analysisTimeframe === 'meal') multiplier = 1 / (profileResult.avgMealsPerDay || 4);

            // FUNZIONE DI CATEGORIZZAZIONE AUTOMATICA
            const categorizeNutrient = (key) => {
                const aminos = [
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
                ];
                const carbo = [
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
                    'alcohol',
                ];
                const bio = [
                    'caffeic_acid',
                    'citric_acid',
                    'phytic_acid',
                    'malic_acid',
                    'apigenin',
                    'campferol',
                    'phytosterols',
                    'polyphenols',
                    'quercetin',
                    'lutein',
                    'zeaxanthin',
                    'lycopene',
                    'beta_carotene',
                    'alpha_carotene',
                    'total_carotenoids',
                ];

                if (aminos.includes(key)) return { label: 'Pool Amminoacidico', icon: 'ph-dna', color: 'text-purple-500' };
                if (carbo.includes(key)) return { label: 'Carboidrati & Fibre Dettagliate', icon: 'ph-grains', color: 'text-amber-500' };
                if (bio.includes(key)) return { label: 'Fitocomposti & Bioattivi', icon: 'ph-leaf', color: 'text-green-500' };
                if (key.includes(':') || key.toLowerCase().includes('fatty_acid') || key === 'cholesterol')
                    return { label: 'Profilo Lipidico Specifico', icon: 'ph-drop', color: 'text-blue-500' };
                return { label: 'Altri Micronutrienti', icon: 'ph-dots-three-circle', color: 'text-gray-500' };
            };

            // Raggruppa i dati extra
            const otherMicros = Object.entries(currentProfile).filter(([k, v]) => {
                // Lista dei campi tecnici da NASCONDERE sempre dai risultati
                const technicalFields = [
                    'food_code',
                    'samples_number',
                    'edible_part',
                    'portion',
                    'energy_kj',
                    'image',
                    'name',
                    'category',
                    'scientific_name',
                    'english_name',
                    'info',
                ];

                return v > 0 && !patientTargets[k] && k !== 'energy_kcal' && !technicalFields.includes(k);
            });
            const groupedMicros = otherMicros.reduce((acc, [key, val]) => {
                const cat = categorizeNutrient(key);
                if (!acc[cat.label]) acc[cat.label] = { items: [], icon: cat.icon, color: cat.color };
                acc[cat.label].items.push({ key, val });
                return acc;
            }, {});

            return (
                <div className="fixed inset-0 z-[13000] flex items-center justify-center p-4 lg:p-6 bg-black/60 backdrop-blur-xl fade-enter">
                    <div className="bg-[#FAFAFC] rounded-[36px] shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden border border-white/20 relative">
                        {/* 1. HEADER SOSPESO "ISOLA" */}
                        <div className="m-4 lg:m-6 bg-gray-900 rounded-[28px] text-white p-4 shrink-0 flex items-center justify-between shadow-xl shadow-black/20 z-20">
                            <div className="flex items-center gap-4 lg:gap-6">
                                <div className="w-12 h-12 rounded-full bg-[color:var(--ink)] flex items-center justify-center border border-gray-600 shadow-inner">
                                    <i className="ph-fill ph-user-circle text-2xl text-gray-300"></i>
                                </div>
                                <div className="flex items-center gap-4 lg:gap-8 text-xs">
                                    <div>
                                        <span className="text-gray-400 block text-[11px] font-semibold mb-0.5">Paziente</span>
                                        <span className="font-bold text-sm text-white">{patientProfile.name}</span>
                                    </div>
                                    <div className="w-px h-8 bg-gray-700"></div>
                                    <div>
                                        <span className="text-gray-400 block text-[11px] font-semibold mb-0.5">Biometria</span>
                                        <span className="font-medium text-gray-200">
                                            {patientProfile.age}y • {patientProfile.gender === 'Male' ? 'Uomo' : 'Donna'} • {patientProfile.weight}kg
                                        </span>
                                    </div>
                                    <div className="w-px h-8 bg-gray-700 hidden lg:block"></div>
                                    <div className="hidden lg:block">
                                        <span className="text-gray-400 block text-[11px] font-semibold mb-1">Clinica</span>
                                        <div className="flex gap-1.5">
                                            {patientProfile.allergies.map((a) => (
                                                <span key={a} className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md text-[11px] font-bold ">
                                                    {a}
                                                </span>
                                            ))}
                                            {patientProfile.pathologies.map((p) => (
                                                <span key={p} className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md text-[11px] font-bold ">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Nel Header nero, aggiungi il tasto Info prima del tasto X */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowGlossary(!showGlossary)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${showGlossary ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'}`}
                                    title="Glossario e Abbreviazioni"
                                >
                                    <i className={`ph-bold ${showGlossary ? 'ph-info-fill' : 'ph-info'} text-lg`}></i>
                                </button>
                                <button
                                    onClick={() => setIsDrvEditorOpen(true)}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 border border-white/20 text-gray-200"
                                >
                                    <i className="ph-bold ph-database"></i> Database EFSA
                                </button>
                                <button
                                    onClick={() => setIsAnalysisOpen(false)}
                                    className="w-10 h-10 bg-white/10 hover:bg-red-500/20 hover:text-red-400 rounded-xl flex items-center justify-center transition-colors border border-white/20"
                                >
                                    <i className="ph-bold ph-x"></i>
                                </button>
                            </div>
                        </div>

                        {/* 2. SUB-HEADER */}
                        <div className="px-8 py-2 flex flex-col md:flex-row justify-between items-start md:items-end shrink-0 z-10 gap-4">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Screening Molecolare (BETA)</h3>
                                <p className="text-xs font-bold text-gray-400 mt-1 ">Incrocio con i DRV</p>
                            </div>
                            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                                {['meal', 'day', 'week'].map((tf) => (
                                    <button
                                        key={tf}
                                        onClick={() => setAnalysisTimeframe(tf)}
                                        className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${analysisTimeframe === tf ? 'bg-black text-white shadow-md transform scale-100' : 'text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        {tf === 'meal' ? 'Stima Pasto' : tf === 'day' ? 'Media Die' : 'Settimana'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* --- SEZIONE GLOSSARIO DINAMICA --- */}
                        {<GlossaryPanel showGlossary={showGlossary} />}

                        {/* 3. GRIGLIA DINAMICA */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-0">
                            {<NutrientTargetsGrid currentProfile={currentProfile} multiplier={multiplier} patientTargets={patientTargets} />}

                            {/* ALTRI COMPONENTI RAGGRUPPATI (ESPANSIONE HTML <details>) */}
                            {<MinorComponentsAccordion groupedMicros={groupedMicros} multiplier={multiplier} otherMicros={otherMicros} />}
                        </div>
                    </div>
                </div>
            );
        })()
    );
};
