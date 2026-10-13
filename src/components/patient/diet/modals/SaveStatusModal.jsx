import React from 'react';

export const SaveStatusModal = ({
    calcData,
    currentPatient,
    dietDays,
    isSaveStatusOpen,
    onUpdateDb,
    savedReports,
    selectedVisitaId,
    setIsSaveStatusOpen,
    targets,
}) => {
    return (
        isSaveStatusOpen && (
            <div className="modal-backdrop" style={{ zIndex: 12000 }}>
                <div className="modal-window" style={{ maxWidth: '450px', height: 'auto', padding: '30px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                        <div
                            style={{
                                width: '60px',
                                height: '60px',
                                background: '#F2F2F7',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 15px auto',
                            }}
                        >
                            <i className="ph-fill ph-carrot" style={{ fontSize: '30px', color: '#121317' }}></i>
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0 }}>Salva e Aggiorna Stato</h3>
                        <p style={{ fontSize: '13px', color: '#6E6D69', marginTop: '5px', fontWeight: 600 }}>In quale fase si trova questo piano alimentare?</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                            { id: 'todo', label: 'Da Creare', color: '#8E8E93', icon: 'ph-clock' },
                            { id: 'draft', label: 'Da Finire', color: '#FF9500', icon: 'ph-pencil-line' },
                            { id: 'pending', label: 'Finito ma da Inviare', color: '#121317', icon: 'ph-paper-plane-tilt' },
                            { id: 'delivery', label: 'Consegnato', color: '#1F8A5B', icon: 'ph-check-circle' },
                            { id: 'edit', label: 'Da Modificare', color: '#C2413A', icon: 'ph-warning-octagon' },
                        ].map((status) => (
                            <div
                                key={status.id}
                                onClick={() => {
                                    // LOGICA DI SALVATAGGIO REALE NEL DB
                                    onUpdateDb((prevDb) => {
                                        const updatedPazienti = prevDb.pazienti.map((p) => {
                                            if (p.id !== currentPatient.id) return p;
                                            const nuoveVisite = (p.visite || []).map((v) => {
                                                if (v.id !== selectedVisitaId) return v;
                                                return {
                                                    ...v,
                                                    dietStatus: status.id, // Aggiorna lo stato scelto
                                                    dettagli: {
                                                        ...v.dettagli,
                                                        diet_calc_data: calcData,
                                                        diet_targets: targets,
                                                        diet_plan_data: dietDays,
                                                        diet_saved_reports: savedReports,
                                                    },
                                                };
                                            });
                                            return { ...p, visite: nuoveVisite };
                                        });
                                        return { ...prevDb, pazienti: updatedPazienti };
                                    });

                                    setIsSaveStatusOpen(false);
                                    alert(`Piano salvato con successo come: ${status.label}`);
                                }}
                                style={{
                                    padding: '16px',
                                    borderRadius: '16px',
                                    border: '1px solid #E6E4DE',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    transition: '0.2s',
                                    background: '#FFFFFF',
                                }}
                                className="laf-row"
                                onMouseOver={(e) => (e.currentTarget.style.borderColor = status.color)}
                                onMouseOut={(e) => (e.currentTarget.style.borderColor = '#E6E4DE')}
                            >
                                <div
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        background: `${status.color}15`,
                                        color: status.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <i className={`ph-bold ${status.icon}`} style={{ fontSize: '18px' }}></i>
                                </div>
                                <span style={{ fontWeight: 800, fontSize: '14px', color: '#121317' }}>{status.label}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsSaveStatusOpen(false)}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: '#F2F2F7',
                            color: '#121317',
                            borderRadius: '14px',
                            border: 'none',
                            fontWeight: 700,
                            cursor: 'pointer',
                            marginTop: '20px',
                            fontSize: '13px',
                        }}
                    >
                        Annulla
                    </button>
                </div>
            </div>
        )
    );
};
