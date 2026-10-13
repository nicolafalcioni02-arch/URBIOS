import React from 'react';

export const ChangeVisitModal = ({ isChangeVisitOpen, listaVisite, selectedVisitaId, setIsChangeVisitOpen, setSelectedVisitaId }) => {
    return (
        isChangeVisitOpen && (
            <div className="modal-backdrop" style={{ zIndex: 11000 }}>
                <div className="modal-window cv-win" style={{ maxWidth: '500px', height: 'auto', padding: '30px', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>Seleziona Visita Clinica</h3>
                            <span style={{ fontSize: '11px', color: '#6E6D69', fontWeight: 600 }}>
                                Associa il piano nutrizionale a una misurazione in storico
                            </span>
                        </div>
                        <button
                            onClick={() => setIsChangeVisitOpen(false)}
                            style={{ border: 'none', background: 'transparent', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            ✕
                        </button>
                    </div>

                    <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                        {listaVisite.filter((v) => v.dettagli && !v.note?.includes('Solo Dieta')).length === 0 ? (
                            <div style={{ padding: '30px', textAlign: 'center', color: '#6E6D69', fontSize: '13px', fontWeight: 600, fontStyle: 'italic' }}>
                                Nessuna visita clinica (antropometrica) registrata per questo paziente.
                            </div>
                        ) : (
                            listaVisite
                                .filter((v) => v.dettagli && !v.note?.includes('Solo Dieta'))
                                .map((v) => {
                                    const isCurrent = selectedVisitaId === v.id;
                                    return (
                                        <div
                                            key={v.id}
                                            onClick={() => {
                                                setSelectedVisitaId(v.id);
                                                setIsChangeVisitOpen(false);
                                            }}
                                            style={{
                                                padding: '12px 16px',
                                                borderRadius: '14px',
                                                border: `1px solid ${isCurrent ? '#1F8A5B' : '#E6E4DE'}`,
                                                background: isCurrent ? '#F1F8F4' : '#FFFFFF',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: '0.2s',
                                            }}
                                            className="laf-row"
                                        >
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '14px', color: '#121317' }}>Visita del {v.data}</div>
                                                <div style={{ fontSize: '11px', color: '#6E6D69', marginTop: '2px', fontWeight: 600 }}>
                                                    Peso rilevato: {v.peso} kg
                                                </div>
                                            </div>
                                            {isCurrent && (
                                                <span
                                                    style={{
                                                        fontSize: '10px',
                                                        fontWeight: 900,
                                                        color: '#1F8A5B',
                                                        background: '#C8E6C9',
                                                        padding: '3px 8px',
                                                        borderRadius: '6px',
                                                    }}
                                                >
                                                    ATTIVA
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                        )}
                    </div>
                    <button
                        onClick={() => setIsChangeVisitOpen(false)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: '#121317',
                            color: 'white',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: 700,
                            cursor: 'pointer',
                            marginTop: '20px',
                            fontSize: '13px',
                        }}
                    >
                        Chiudi Finestra
                    </button>
                </div>
            </div>
        )
    );
};
