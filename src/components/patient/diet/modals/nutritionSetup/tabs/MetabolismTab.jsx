import React from 'react';

export const MetabolismTab = ({ adjustedW, calcData, idealW, rmr, setCalcData, setIsLafModalOpen, setupTab, tdee }) => {
    return (
        setupTab === 'metabolismo & energia' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div className="smart-card" style={{ padding: '25px' }}>
                    <span className="smart-title" style={{ marginBottom: '15px' }}>
                        1. Peso di Riferimento per Calcolo RMR
                    </span>
                    <div className="segmented-control">
                        <button
                            className={`segmented-btn ${calcData.weightTarget === 'actual' ? 'active' : ''}`}
                            onClick={() => setCalcData({ ...calcData, weightTarget: 'actual' })}
                        >
                            Attuale ({calcData.weight}kg)
                        </button>
                        <button
                            className={`segmented-btn ${calcData.weightTarget === 'ideal' ? 'active' : ''}`}
                            onClick={() => setCalcData({ ...calcData, weightTarget: 'ideal' })}
                        >
                            Ideale ({idealW.toFixed(1)}kg)
                        </button>
                        <button
                            className={`segmented-btn ${calcData.weightTarget === 'adjusted' ? 'active' : ''}`}
                            onClick={() => setCalcData({ ...calcData, weightTarget: 'adjusted' })}
                        >
                            Aggiustato ({adjustedW.toFixed(1)}kg)
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="t-input-floating">
                        <label>Equazione Predittiva (RMR)</label>
                        <select value={calcData.formula} onChange={(e) => setCalcData({ ...calcData, formula: e.target.value })}>
                            <option value="mifflin">Mifflin-St Jeor</option>
                            <option value="harris">Harris-Benedict</option>
                            <option value="katch">Katch-McArdle</option>
                            <option value="schofield_18_29">Schofield 18-29</option>
                            <option value="schofield_30_59">Schofield 30-59</option>
                            <option value="schofield_60">Schofield &gt; 60</option>
                        </select>
                    </div>
                    <div className="t-input-floating">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Livello Attività Fisica (LAF)</label>
                            {/* TASTO SMART PER APRIRE IL CALCOLATORE 24H */}
                            <button
                                onClick={() => setIsLafModalOpen(true)}
                                style={{
                                    background: '#1F8A5B',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '9px',
                                    fontWeight: 900,
                                    padding: '4px 8px',
                                    cursor: 'pointer',
                                }}
                            >
                                CALCOLO PRO (24H)
                            </button>
                        </div>
                        <select value={calcData.laf} onChange={(e) => setCalcData({ ...calcData, laf: parseFloat(e.target.value) })}>
                            <option value="1.2">1.20 - Sedentario</option>
                            <option value="1.45">1.45 - Leggero</option>
                            <option value="1.65">1.65 - Moderato</option>
                            <option value="1.85">1.85 - Intenso</option>
                            <option value={calcData.laf} hidden>
                                {calcData.laf} - Personalizzato
                            </option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
                    <div className="smart-card" style={{ background: '#121317', color: 'white', borderColor: '#121317' }}>
                        <span className="smart-title" style={{ color: '#6E6D69' }}>
                            Fabbisogno Energetico Totale (TDEE)
                        </span>
                        <div style={{ fontSize: '42px', fontWeight: 900, color: '#1F8A5B', marginTop: '10px' }}>
                            {/* Il TDEE ora si aggiorna istantaneamente in base al peso scelto sopra */}
                            {tdee} <span style={{ fontSize: '16px', color: 'white' }}>KCAL / Die</span>
                        </div>
                        <span className="smart-sub" style={{ color: '#6E6D69' }}>
                            Metabolismo Basale: {Math.round(rmr)} kcal (Peso:{' '}
                            {calcData.weightTarget === 'ideal'
                                ? idealW.toFixed(1)
                                : calcData.weightTarget === 'adjusted'
                                  ? adjustedW.toFixed(1)
                                  : calcData.weight}
                            kg)
                        </span>
                    </div>
                </div>
            </div>
        )
    );
};
