import React from 'react';
import { getMorfotipo } from '../../../logic/clinicalFormulas';

export const AnthropometryTab = ({ adjustedW, bmi, bmiStatus, calcData, grant, idealW, setCalcData, setupTab, whr, whrStatus }) => {
    return (
        setupTab === 'antropometria' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {/* Input Dati */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '15px',
                        background: '#FFFFFF',
                        padding: '20px',
                        borderRadius: '24px',
                        border: '1px solid #E5E5EA',
                    }}
                >
                    <div className="t-input-floating">
                        <label>Sesso</label>
                        <select value={calcData.sex} onChange={(e) => setCalcData({ ...calcData, sex: e.target.value })}>
                            <option value="M">M</option>
                            <option value="F">F</option>
                        </select>
                    </div>
                    <div className="t-input-floating">
                        <label>Età</label>
                        <input type="number" value={calcData.age} onChange={(e) => setCalcData({ ...calcData, age: e.target.value })} />
                    </div>
                    <div className="t-input-floating">
                        <label>Peso (kg)</label>
                        <input type="number" value={calcData.weight} onChange={(e) => setCalcData({ ...calcData, weight: e.target.value })} />
                    </div>
                    <div className="t-input-floating">
                        <label>Altezza (cm)</label>
                        <input type="number" value={calcData.height} onChange={(e) => setCalcData({ ...calcData, height: e.target.value })} />
                    </div>
                    <div className="t-input-floating">
                        <label>Vita (cm)</label>
                        <input type="number" value={calcData.waist} onChange={(e) => setCalcData({ ...calcData, waist: e.target.value })} />
                    </div>
                    <div className="t-input-floating">
                        <label>Fianchi (cm)</label>
                        <input type="number" value={calcData.hip} onChange={(e) => setCalcData({ ...calcData, hip: e.target.value })} />
                    </div>
                    <div className="t-input-floating">
                        <label>Polso (cm)</label>
                        <input type="number" value={calcData.wrist} onChange={(e) => setCalcData({ ...calcData, wrist: e.target.value })} />
                    </div>
                </div>

                {/* Smart Cards Valutazione */}
                <div className="smart-card-grid">
                    <div className="smart-card">
                        <div className="smart-badge" style={{ background: bmiStatus.color }}>
                            {bmiStatus.label}
                        </div>
                        <span className="smart-title">Indice BMI</span>
                        <span className="smart-value">{bmi.toFixed(1)}</span>
                        <span className="smart-sub">Range Normale: 18.5 - 24.9</span>
                    </div>
                    <div className="smart-card">
                        <div className="smart-badge" style={{ background: whrStatus.color }}>
                            {whrStatus.label}
                        </div>
                        <span className="smart-title">Rapporto WHR</span>
                        <span className="smart-value">{whr.toFixed(2)}</span>
                        <span className="smart-sub">Indicatore Rischio Cardiovascolare</span>
                    </div>
                    <div className="smart-card">
                        <span className="smart-title">Peso Ideale / ABW</span>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'baseline', marginTop: '5px' }}>
                            <span style={{ fontSize: '22px', fontWeight: 900, color: '#00C853' }}>
                                {idealW.toFixed(1)} <span style={{ fontSize: '12px', color: '#86868B' }}>kg (PI)</span>
                            </span>
                            <span style={{ fontSize: '18px', fontWeight: 800, color: '#1D1D1F' }}>
                                {adjustedW.toFixed(1)} <span style={{ fontSize: '12px', color: '#86868B' }}>kg (ABW)</span>
                            </span>
                        </div>
                        <span className="smart-sub">Lorentz (PI) &bull; Aggiustato per Obesità (ABW)</span>
                    </div>
                    <div className="smart-card">
                        <span className="smart-title">Morfotipo (Grant)</span>
                        <span className="smart-value">{grant.toFixed(1)}</span>
                        <span className="smart-sub" style={{ color: '#007AFF', fontWeight: 800 }}>
                            {getMorfotipo(grant, calcData.sex).toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
        )
    );
};
