import React from 'react';

export const DietMenuView = ({
    calcData,
    currentPatient,
    listaVisite,
    onUpdateDb,
    setCalcData,
    setDietDays,
    setDietViewMode,
    setSavedReports,
    setSelectedVisitaId,
    setTargets,
}) => {
    const oggi = new Date().toLocaleDateString('en-CA');
    const visitaOggi = listaVisite.find((v) => v.data === oggi && !v.note?.includes('Solo Dieta'));

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '80vh',
                gap: '40px',
                background: '#F8F9FA',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            }}
        >
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '10px', color: '#1D1D1F' }}>Inizia il Piano Alimentare</h2>
                <p style={{ color: '#86868B', fontWeight: 600 }}>Cosa desideri fare oggi per il paziente {currentPatient.nome}?</p>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                {/* COLONNA A: DIETA ASSOCIATA A VISITA REALE */}
                <div
                    style={{
                        width: '300px',
                        padding: '30px',
                        background: 'white',
                        borderRadius: '24px',
                        border: '1px solid #E5E5EA',
                        textAlign: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                    }}
                >
                    <i className="ph-bold ph-calendar-check" style={{ fontSize: '40px', color: '#00C853', marginBottom: '15px', display: 'block' }}></i>
                    <h3 style={{ fontWeight: 800, fontSize: '16px', margin: '0 0 10px 0' }}>Dieta associata a visita</h3>

                    {!visitaOggi ? (
                        <div
                            style={{
                                background: '#FFF0F0',
                                color: '#FF3B30',
                                padding: '10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: 800,
                                margin: '15px 0',
                            }}
                        >
                            Attenzione: oggi non è stata salvata alcuna visita.
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                                // Sincronizzazione Totale dei Dati Pre-Editor
                                if (visitaOggi.dettagli?.diet_calc_data) setCalcData(visitaOggi.dettagli.diet_calc_data);
                                setTargets(visitaOggi.dettagli?.diet_targets || { kcal: 0, p: 0, c: 0, f: 0, isConfigured: false });
                                setDietDays(visitaOggi.dettagli?.diet_plan_data || []);
                                setSavedReports(visitaOggi.dettagli?.diet_saved_reports || []);
                                setSelectedVisitaId(visitaOggi.id);

                                // Flush e avvio
                                setTimeout(() => setDietViewMode('editor'), 50);
                            }}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#1D1D1F',
                                color: 'white',
                                borderRadius: '12px',
                                border: 'none',
                                fontWeight: 700,
                                cursor: 'pointer',
                                marginTop: '15px',
                                transition: '0.2s',
                            }}
                        >
                            Avvia Piano su Visita
                        </button>
                    )}
                </div>

                {/* COLONNA B: DIETA INDIPENDENTE */}
                <div
                    style={{
                        width: '300px',
                        padding: '30px',
                        background: 'white',
                        borderRadius: '24px',
                        border: '1px solid #E5E5EA',
                        textAlign: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                    }}
                >
                    <i className="ph-bold ph-lightning" style={{ fontSize: '40px', color: '#007AFF', marginBottom: '15px', display: 'block' }}></i>
                    <h3 style={{ fontWeight: 800, fontSize: '16px', margin: '0 0 10px 0' }}>Dieta indipendente</h3>
                    <p style={{ fontSize: '12px', color: '#86868B', margin: '15px 0' }}>Crea un piano slegato dalla visita odierna.</p>

                    <button
                        onClick={() => {
                            // 1. CREA LA NUOVA VISITA "FITTIZIA" E OTTIENI L'ID
                            const nuovoId = Date.now();
                            const nuovaVisitaSoloDieta = {
                                id: nuovoId,
                                data: new Date().toLocaleDateString('en-CA'),
                                peso: calcData.weight || 70,
                                dietStatus: 'active',
                                note: 'Piano Nutrizionale Indipendente (Solo Dieta)',
                                dettagli: {
                                    diet_calc_data: calcData,
                                    diet_targets: { kcal: 0, p: 0, c: 0, f: 0, isConfigured: false },
                                    diet_plan_data: [],
                                    diet_saved_reports: [],
                                },
                            };

                            // 2. AGGIORNA IL DB DIRETTAMENTE
                            onUpdateDb((prevDb) => {
                                const updated = prevDb.pazienti.map((p) =>
                                    p.id === currentPatient.id ? { ...p, visite: [nuovaVisitaSoloDieta, ...(p.visite || [])] } : p
                                );
                                return { ...prevDb, pazienti: updated };
                            });

                            // 3. FORZA LO STATO LOCALE A SVUOTARSI PER ACCOGLIERE IL NUOVO PIANO
                            setTargets({ kcal: 0, p: 0, c: 0, f: 0, isConfigured: false });
                            setDietDays([]);
                            setSavedReports([]);
                            setSelectedVisitaId(nuovoId);

                            // 4. ENTRA NELL'EDITOR (Ritardo minimo per garantire l'aggiornamento React)
                            setTimeout(() => setDietViewMode('editor'), 50);
                        }}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: '#007AFF',
                            color: 'white',
                            borderRadius: '12px',
                            border: 'none',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: '0.2s',
                        }}
                    >
                        Avvia Piano Indipendente
                    </button>
                </div>
            </div>
        </div>
    );
};
