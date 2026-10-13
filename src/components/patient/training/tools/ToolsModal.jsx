import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { MassimaliTool } from './MassimaliTool';
import { CardioTool } from './CardioTool';
import { EnergyTool } from './EnergyTool';
import { RecoveryTool } from './RecoveryTool';
import { GuidelinesTool } from './GuidelinesTool';

const TABS = [
    ['massimali', 'Massimali e carichi', 'ph-barbell'],
    ['cardio', 'Cardio e FC', 'ph-heartbeat'],
    ['energia', 'Dispendio energetico', 'ph-fire'],
    ['recupero', 'Recupero e carico', 'ph-moon'],
    ['linee', 'Linee guida', 'ph-book-open'],
];

// Calcolatori per la programmazione. I dati del cliente (peso, età, sesso) sono precompilati dall'anagrafica e dall'ultima visita.
export const ToolsModal = ({ profile, massimali, exerciseDB, saveMassimale, deleteMassimale, initialTab = 'massimali', onClose }) => {
    const [tab, setTab] = useState(initialTab);
    return ReactDOM.createPortal(
        <div className="t-modal-overlay" style={{ display: 'flex', zIndex: 25000 }} onClick={onClose}>
            <div
                className="t-modal-card"
                style={{ width: 960, maxWidth: '96vw', height: '88vh', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px 0' }}>
                    <div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Calcolatori e massimali</h2>
                        {profile && (
                            <div style={{ fontSize: 12, color: '#86868B', marginTop: 2 }}>
                                Dati del cliente: {profile.weightKg ? `${profile.weightKg} kg` : 'peso n.d.'} ·{' '}
                                {profile.heightCm ? `${profile.heightCm} cm` : 'altezza n.d.'} · {profile.age ? `${profile.age} anni` : 'età n.d.'} ·{' '}
                                {profile.sex === 'F' ? 'donna' : 'uomo'}
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="t-icon-btn" style={{ width: 40, height: 40, background: '#F5F5F7', border: 'none' }}>
                        <i className="ph-bold ph-x"></i>
                    </button>
                </div>
                <div style={{ display: 'flex', gap: 6, padding: '14px 28px 0', flexWrap: 'wrap' }}>
                    {TABS.map(([id, label, icon]) => (
                        <button
                            key={id}
                            onClick={() => setTab(id)}
                            style={{
                                border: 'none',
                                borderRadius: 999,
                                padding: '9px 16px',
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: 'pointer',
                                background: tab === id ? '#1D1D1F' : '#F0F0F3',
                                color: tab === id ? '#fff' : '#444',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            <i className={`ph ${icon}`}></i> {label}
                        </button>
                    ))}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '18px 28px 28px' }}>
                    {tab === 'massimali' && (
                        <MassimaliTool massimali={massimali} exerciseDB={exerciseDB} saveMassimale={saveMassimale} deleteMassimale={deleteMassimale} />
                    )}
                    {tab === 'cardio' && <CardioTool profile={profile} />}
                    {tab === 'energia' && <EnergyTool profile={profile} />}
                    {tab === 'recupero' && <RecoveryTool />}
                    {tab === 'linee' && <GuidelinesTool />}
                </div>
            </div>
        </div>,
        document.body
    );
};
