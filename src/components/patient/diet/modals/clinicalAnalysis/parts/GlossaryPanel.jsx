import React from 'react';

export const GlossaryPanel = ({ showGlossary }) => {
    return (
        showGlossary && (
            <div className="mx-8 mt-4 mb-8 bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden animate-fade-in-down">
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* DEFINIZIONI */}
                    <div>
                        <h5 className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-4 flex items-center gap-2">
                            <i className="ph-fill ph-book-open text-lg"></i> Glossary & Definitions
                        </h5>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                            {[
                                {
                                    t: 'Adequate intake (AI)',
                                    d: "Value set when data is insufficient for an average requirement. It's assumed to be adequate based on observations.",
                                },
                                { t: 'Average requirement (AR)', d: 'Intake meeting the daily needs of half the people in a healthy population.' },
                                {
                                    t: 'Population reference intake (PRI)',
                                    d: 'Intake likely to meet the daily needs of almost all people in a healthy population.',
                                },
                                {
                                    t: 'Tolerable upper intake level (UL)',
                                    d: 'The maximum chronic daily intake unlikely to pose risk of adverse health effects.',
                                },
                                { t: 'Reference intake range (RI)', d: 'Energy proportion (%) for macronutrients adequate for maintaining health.' },
                                {
                                    t: 'Safe and Adequate Intake',
                                    d: 'Used for Sodium/Chloride: a level compatible with good health while minimizing CVD risk.',
                                },
                                { t: 'Safe level of intake', d: "Highest level with confidence in absence of adverse effects when UL can't be set." },
                                { t: 'Macronutrient', d: 'Fat, protein, carbohydrate needed in significant quantities for growth and health.' },
                                { t: 'Micronutrient', d: 'Vitamins and minerals required in tiny amounts for normal development.' },
                                { t: 'Target population', d: 'Healthy population defined by specific age range and gender (e.g., pregnant women).' },
                            ].map((item) => (
                                <div key={item.t} className="group">
                                    <dt className="text-xs font-black text-gray-900 group-hover:text-blue-600 transition-colors">{item.t}</dt>
                                    <dd className="text-[11px] text-gray-500 leading-relaxed mt-0.5">{item.d}</dd>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ABBREVIAZIONI */}
                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                        <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
                            <i className="ph-fill ph-text-aa text-lg"></i> Abbreviations
                        </h5>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
                            {[
                                { a: 'ALA', d: 'Alpha-linolenic acid' },
                                { a: 'DFE', d: 'Dietary folate equivalent' },
                                { a: 'DHA', d: 'Docosahexaenoic acid' },
                                { a: 'EPA', d: 'Eicosapentaenoic acid' },
                                { a: 'SFA', d: 'Saturated fatty acids' },
                                { a: 'TFA', d: 'Trans-fatty acids' },
                                { a: 'RE', d: 'Retinol equivalent' },
                                { a: 'NE', d: 'Niacin equivalent' },
                                { a: 'PAL', d: 'Physical activity level' },
                                { a: 'bw', d: 'body weight' },
                                { a: 'E%', d: 'Energy intake %' },
                                { a: 'ND / NA', d: 'Not Defined / Applicable' },
                            ].map((abb) => (
                                <div key={abb.a} className="flex flex-col">
                                    <span className="text-[10px] font-black text-blue-600">{abb.a}</span>
                                    <span className="text-[9px] font-bold text-gray-400 truncate" title={abb.d}>
                                        {abb.d}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-[9px] text-gray-400 italic leading-tight">
                                * Reference values (DRVs) are based on EFSA (European Food Safety Authority) and LARN 2024 standards.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};
