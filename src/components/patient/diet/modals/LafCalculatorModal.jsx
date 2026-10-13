import React from 'react';

export const LafCalculatorModal = ({
    applyLafTemplate,
    calcData,
    calculatedLAF,
    isLafModalOpen,
    lafActivities,
    setCalcData,
    setIsLafModalOpen,
    setLafActivities,
    totalLafHours,
}) => {
    return (
        isLafModalOpen && (
            <div className="modal-backdrop" style={{ zIndex: 10000 }}>
                <div className="modal-window" style={{ width: '650px', maxWidth: '95%', padding: '0', background: '#FAFAFC' }}>
                    <div
                        style={{
                            padding: '20px',
                            borderBottom: '1px solid #E6E4DE',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'white',
                        }}
                    >
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900 }}>Calcolatore LAF (Metodo 24h)</h3>
                        <button
                            onClick={() => setIsLafModalOpen(false)}
                            style={{ border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer', fontWeight: 900 }}
                        >
                            ✕
                        </button>
                    </div>

                    <div style={{ padding: '20px' }}>
                        {/* Pre-caricamento Giornata Tipo */}
                        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#6E6D69' }}>CARICA GIORNATA TIPO:</span>
                            <button
                                onClick={() => applyLafTemplate('sedentario')}
                                className="setup-tab-btn"
                                style={{ background: 'white', border: '1px solid #E6E4DE' }}
                            >
                                Sedentario
                            </button>
                            <button
                                onClick={() => applyLafTemplate('leggero')}
                                className="setup-tab-btn"
                                style={{ background: 'white', border: '1px solid #E6E4DE' }}
                            >
                                Leggero
                            </button>
                            <button
                                onClick={() => applyLafTemplate('attivo')}
                                className="setup-tab-btn"
                                style={{ background: 'white', border: '1px solid #E6E4DE' }}
                            >
                                Attivo
                            </button>
                        </div>

                        {/* Tabella 24 Ore */}
                        <table
                            className="matrix-table"
                            style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}
                        >
                            <thead style={{ background: '#F6F5F2' }}>
                                <tr>
                                    <th>Attività</th>
                                    <th style={{ textAlign: 'center' }}>Coeff. (PAL)</th>
                                    <th style={{ textAlign: 'center' }}>Ore</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lafActivities.map((act, index) => (
                                    <tr key={act.id} className="laf-row">
                                        <td>
                                            <input
                                                type="text"
                                                className="laf-input"
                                                value={act.name}
                                                onChange={(e) => {
                                                    const newActs = [...lafActivities];
                                                    newActs[index].name = e.target.value;
                                                    setLafActivities(newActs);
                                                }}
                                            />
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px' }}>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="laf-input number"
                                                value={act.pal}
                                                onChange={(e) => {
                                                    const newActs = [...lafActivities];
                                                    newActs[index].pal = parseFloat(e.target.value) || 0;
                                                    setLafActivities(newActs);
                                                }}
                                            />
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '5px' }}>
                                            <input
                                                type="number"
                                                step="0.5"
                                                className="laf-input number"
                                                value={act.hours}
                                                onChange={(e) => {
                                                    const newActs = [...lafActivities];
                                                    newActs[index].hours = parseFloat(e.target.value) || 0;
                                                    setLafActivities(newActs);
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Controlli Totali */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '20px',
                                padding: '15px',
                                background: totalLafHours === 24 ? '#F1F8F4' : '#FFF0F0',
                                borderRadius: '12px',
                                border: `1px solid ${totalLafHours === 24 ? '#1F8A5B' : '#C2413A'}`,
                            }}
                        >
                            <div>
                                <span style={{ fontSize: '11px', fontWeight: 800, color: totalLafHours === 24 ? '#1F8A5B' : '#C2413A', display: 'block' }}>
                                    SOMMA ORE
                                </span>
                                <span style={{ fontSize: '20px', fontWeight: 900 }}>{totalLafHours} / 24</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#6E6D69', display: 'block' }}>LAF FINALE</span>
                                <span style={{ fontSize: '24px', fontWeight: 900, color: '#121317' }}>{totalLafHours === 24 ? calculatedLAF : '---'}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '20px', background: 'white', borderTop: '1px solid #E6E4DE', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            disabled={totalLafHours !== 24}
                            onClick={() => {
                                setCalcData({ ...calcData, laf: parseFloat(calculatedLAF) });
                                setIsLafModalOpen(false);
                            }}
                            style={{
                                background: totalLafHours === 24 ? '#1F8A5B' : '#E6E4DE',
                                color: totalLafHours === 24 ? 'white' : '#6E6D69',
                                padding: '12px 30px',
                                borderRadius: '10px',
                                border: 'none',
                                fontWeight: 900,
                                cursor: totalLafHours === 24 ? 'pointer' : 'not-allowed',
                            }}
                        >
                            TRASFERISCI AL PIANO
                        </button>
                    </div>
                </div>
            </div>
        )
    );
};
