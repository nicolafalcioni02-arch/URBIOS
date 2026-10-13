import React from 'react';
import { AnalysisStatsPanel } from './parts/AnalysisStatsPanel';
import { DayOverviewCards } from './parts/DayOverviewCards';
import { PlanModeSwitcher } from './parts/PlanModeSwitcher';
import { SavedReportsArchive } from './parts/SavedReportsArchive';

export const DietMainContent = ({
    analysisTargetId,
    deleteReport,
    dietDays,
    listaVisite,
    patient,
    savedReports,
    setActiveMealInfo,
    setAnalysisTargetId,
    setCalcData,
    setDietDays,
    setDietViewMode,
    setIsChangeVisitOpen,
    setIsSaveStatusOpen,
    setIsSetupOpen,
    setSavedReports,
    setSelectedVisitaId,
    setTargets,
    targets,
    updateDayTitle,
    updateMealTitle,
    visitaAttiva,
}) => {
    return (
        <main className="t-main-content">
            {/* BARRA SUPERIORE GESTIONALE DIETA */}
            <div
                className="no-print"
                style={{
                    background: '#FFFFFF',
                    padding: '16px 24px',
                    borderRadius: '20px',
                    border: '1px solid #E5E5EA',
                    marginBottom: '25px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: '950px',
                    margin: '0 auto 25px auto',
                }}
            >
                {/* INFO DIETA ATTIVA (A SINISTRA) + TASTO INDIETRO CONTESTUALE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#86868B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Modalità Piano:
                    </span>

                    {<PlanModeSwitcher setIsChangeVisitOpen={setIsChangeVisitOpen} visitaAttiva={visitaAttiva} />}

                    {/* TASTO INDIETRO AGGIORNATO CON RESET DEL CONTESTO */}
                    <button
                        onClick={() => {
                            // 1. Trova l'ultima visita VERA (Non "Solo Dieta")
                            const primaVisitaClinica = listaVisite.find((v) => v.dettagli && !v.note?.includes('Solo Dieta'));

                            // 2. Ricarica istantaneamente i dati base in memoria per "spurgare" la Dieta Indipendente
                            if (primaVisitaClinica) {
                                if (primaVisitaClinica.dettagli?.diet_calc_data) setCalcData(primaVisitaClinica.dettagli.diet_calc_data);
                                setTargets(primaVisitaClinica.dettagli?.diet_targets || { kcal: 0, p: 0, c: 0, f: 0, isConfigured: false });
                                setDietDays(primaVisitaClinica.dettagli?.diet_plan_data || []);
                                setSavedReports(primaVisitaClinica.dettagli?.diet_saved_reports || []);
                                setSelectedVisitaId(primaVisitaClinica.id);
                            } else {
                                setSelectedVisitaId(null);
                                setDietDays([]);
                            }

                            // 3. Torna al menu
                            setTimeout(() => setDietViewMode('menu'), 50);
                        }}
                        style={{
                            background: '#F5F5F7',
                            color: '#1D1D1F',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}
                        title="Cambia modalità piano"
                    >
                        ← Cambia Modalità
                    </button>
                </div>

                {/* TASTO SALVA CHE APRE IL MODALE STATUS */}
                <div>
                    <button
                        onClick={() => setIsSaveStatusOpen(true)}
                        style={{
                            background: '#1D1D1F',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '10px 24px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: '0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        Salva e Gestisci
                    </button>
                </div>
            </div>

            <div className="t-container-wrapper">
                {!targets?.isConfigured ? (
                    /* LOCK SCREEN COMPLETO: SE NON CONFIGURATO, COMPARE SOLO QUESTO BOX AL CENTRO, SENZA ELEMENTI SOTTO */
                    <div
                        style={{
                            width: '100%',
                            minHeight: '65vh',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#86868B',
                            background: '#FFFFFF',
                            borderRadius: '32px',
                            border: '2px dashed #E5E5EA',
                            padding: '40px',
                        }}
                    >
                        <div style={{ background: '#F2FFF7', padding: '24px', borderRadius: '24px', marginBottom: '25px', border: '1px solid #C8E6C9' }}>
                            <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#00C853"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M12 16v-4"></path>
                                <path d="M12 8h.01"></path>
                            </svg>
                        </div>
                        <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#1D1D1F', marginBottom: '12px', letterSpacing: '-0.5px' }}>
                            Setup Obiettivi Richiesto
                        </h3>
                        <p
                            style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                maxWidth: '440px',
                                textAlign: 'center',
                                lineHeight: '1.6',
                                marginBottom: '35px',
                                color: '#86868B',
                            }}
                        >
                            Per iniziare la compilazione del piano nutrizionale, configura prima i parametri.
                        </p>
                        <button
                            onClick={() => setIsSetupOpen(true)}
                            style={{
                                background: '#00C853',
                                color: 'white',
                                border: 'none',
                                padding: '16px 40px',
                                borderRadius: '16px',
                                fontSize: '15px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                boxShadow: '0 8px 24px rgba(0,200,83,0.25)',
                                transition: '0.2s',
                            }}
                        >
                            Inizia
                        </button>
                    </div>
                ) : (
                    /* APRE L'INTERA PLANCIA COMPLETA SOLO DOPO IL SETUP COMPILATO */
                    <>
                        {/* 1. INTESTAZIONE CLIENTE */}
                        <div className="t-client-header-card">
                            <div className="t-input-floating">
                                <label>Cliente</label>
                                <input type="text" defaultValue={patient ? `${patient.nome} ${patient.cognome}` : ''} readOnly placeholder="Nome Cognome" />
                            </div>
                            <div className="t-input-floating">
                                <label>Data Inizio</label>
                                <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="t-input-floating">
                                <label>Target Kcal</label>
                                <div style={{ padding: '12px 16px', fontSize: '18px', fontWeight: 800, color: '#00C853' }}>{targets.kcal} kcal</div>
                            </div>
                        </div>

                        {/* 2. DASHBOARD ANALITICA */}
                        <section className="no-print" style={{ marginBottom: '40px' }}>
                            <div className="analysis-nav">
                                <div className={`analysis-chip ${analysisTargetId === 'all' ? 'active' : ''}`} onClick={() => setAnalysisTargetId('all')}>
                                    Piano Completo
                                </div>
                                {dietDays.map((day, idx) => (
                                    <div
                                        key={day.id}
                                        className={`analysis-chip ${analysisTargetId === day.id ? 'active' : ''}`}
                                        onClick={() => setAnalysisTargetId(day.id)}
                                    >
                                        G{idx + 1}
                                    </div>
                                ))}
                            </div>

                            {<AnalysisStatsPanel analysisTargetId={analysisTargetId} dietDays={dietDays} />}
                        </section>

                        {/* 3. PANORAMICA DEL PIANO ALIMENTARE (Tutti i giorni) */}
                        <div style={{ marginTop: '40px', marginBottom: '20px', borderBottom: '2px solid #E5E5EA', paddingBottom: '10px' }}>
                            <span style={{ fontSize: '22px', fontWeight: 800, color: '#1D1D1F' }}>Panoramica del Piano Alimentare</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {
                                <DayOverviewCards
                                    dietDays={dietDays}
                                    setActiveMealInfo={setActiveMealInfo}
                                    updateDayTitle={updateDayTitle}
                                    updateMealTitle={updateMealTitle}
                                />
                            }
                        </div>

                        {/* 4. ARCHIVIO REPORT CLINICI */}
                        {<SavedReportsArchive deleteReport={deleteReport} dietDays={dietDays} savedReports={savedReports} />}
                    </>
                )}
            </div>
        </main>
    );
};
