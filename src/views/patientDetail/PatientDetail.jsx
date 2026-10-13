import { useState, useEffect } from 'react';
import { PatientHeader } from './parts/PatientHeader';
import { PatientTabContent } from './parts/PatientTabContent';
import { usePatientVisitActions } from './hooks/usePatientVisitActions';

export const PatientDetail = ({ patient, onBack, onUpdateDb, db, readOnly = false }) => {
    // un paziente senza visite parte dall'anagrafica, gli altri dallo storico
    const [view, setView] = useState(patient?.visite?.length ? 'history' : 'info');
    const [status, setStatus] = useState(patient?.status || 'Attivo');
    const [dietViewMode, setDietViewMode] = useState('menu');

    useEffect(() => {
        setDietViewMode('menu');
    }, [patient?.id]);

    // --- 1. CONFIGURAZIONI FORMULE ---
    // Protezione: se db.formule non esiste, usiamo un array vuoto per non far crashare tutto
    const formule = db?.formule || [];
    const formulePliche = formule.filter((f) => f.categoria === 'Densità Corporea');
    const formuleConv = formule.filter((f) => f.categoria === 'Conversione %FM' || f.titolo?.includes('Siri'));

    const [configA, setConfigA] = useState({
        densId: formulePliche[0]?.id,
        convId: formuleConv.find((f) => f.titolo?.includes('Siri'))?.id,
    });
    const [configB, setConfigB] = useState({
        densId: formulePliche[1]?.id || formulePliche[0]?.id,
        convId: formuleConv.find((f) => f.titolo?.includes('Siri'))?.id,
    });

    // --- 2. STATO INPUT VISITA ---
    const [visitDraft, setVisitDraft] = useState({
        peso: '',
        altezza: '',
        note: '',
        biva_rz: '',
        biva_xc: '',
        biva_angolo: '',
        note_biva: '',
        pl_pettorale: '',
        pl_tricipite: '',
        pl_bicipite: '',
        pl_sottoscap: '',
        pl_ascellare: '',
        pl_addome: '',
        pl_sovrailiaca: '',
        pl_coscia: '',
        pl_polpaccio: '',
        cm_collo: '',
        cm_torace: '',
        cm_vita_min: '',
        cm_fianchi_max: '',
        circ_braccio_sx: '',
        circ_braccio_dx: '',
        circ_avambr_sx: '',
        circ_avambr_dx: '',
        circ_polso_sx: '',
        circ_polso_dx: '',
        circ_coscia_sx: '',
        circ_coscia_dx: '',
        circ_polpaccio_sx: '',
        circ_polpaccio_dx: '',
        circ_caviglia_sx: '',
        circ_caviglia_dx: '',
        dm_omero: '',
        dm_femore: '',
        dm_polso: '',
        dm_biacrom: '',
        dm_biiliaco: '',
        dm_torace_trasv: '',
        len_seduto: '',
        len_span: '',
        len_braccio: '',
        len_avambr: '',
        len_coscia: '',
        len_gamba: '',
        pa_max: '',
        pa_min: '',
        hr: '',
        spo2: '',
        ore_sonno: '',
        qualita_sonno: '',
        stress: '',
        umore: '',
        energia: '',
        fame_emotiva: '',
        alvo: '',
        alvo_freq: '',
        gonfiore: '',
        diuresi: '',
        bg_glicemia: '',
        bg_insulina: '',
        bg_hba1c: '',
        bg_homair: '',
        bg_homabeta: '',
        bl_col_tot: '',
        bl_hdl: '',
        bl_ldl: '',
        bl_trig: '',
        bl_apob: '',
        bt_tsh: '',
        bt_ft3: '',
        bt_ft4: '',
        bt_t3: '',
        bt_t4: '',
        bt_anti_tpo: '',
        bt_anti_tg: '',
        br_crea: '',
        br_egfr: '',
        br_urea: '',
        br_urico: '',
        br_microalb: '',
        br_ph_urine: '',
        br_peso_spec: '',
        br_ast: '',
        br_alt: '',
        br_gamma_gt: '',
        br_bilirubina_totale: '',
        br_fosfatasi_alcalina: '',
        br_sodio: '',
        br_potassio: '',
        br_magnesio: '',
        br_calcio: '',
        br_cloro: '',
        br_fosforo: '',
        br_pcr: '',
        br_ves: '',
        br_omocisteina: '',
        br_sideremia_ferro: '',
        br_ferritina: '',
        br_transferrina: '',
        br_sat_transferrina: '',
        br_testosterone_tot: '',
        br_estradiolo_e2: '',
        br_progesterone: '',
        br_prolattina: '',
        br_lh_luteinizzante: '',
        br_fsh_follicolo: '',
        Anamnesi: '',
        Attivita_Fisica: '',
        Note_Rilevanti: '',
        Note_Benessere_Psico_Fisico: '',
        Note_Funzioni_Organiche: '',
        Note_Metabolismo_Cardio: '',
        valutazione_report: '',
    });

    const { updateDraft, updatePatientInfo, handleFinalizeVisit } = usePatientVisitActions({
        configA,
        configB,
        db,
        onUpdateDb,
        patient,
        setView,
        setVisitDraft,
        visitDraft,
    });

    return (
        <div className="h-full flex flex-col bg-[var(--paper)] relative z-20">
            {/* HEADER */}
            <PatientHeader onBack={onBack} patient={patient} setView={setView} status={status} view={view} readOnly={readOnly} />

            <PatientTabContent
                configA={configA}
                configB={configB}
                db={db}
                dietViewMode={dietViewMode}
                handleFinalizeVisit={handleFinalizeVisit}
                onUpdateDb={onUpdateDb}
                patient={patient}
                setConfigA={setConfigA}
                setConfigB={setConfigB}
                setDietViewMode={setDietViewMode}
                updateDraft={updateDraft}
                updatePatientInfo={updatePatientInfo}
                view={view}
                visitDraft={visitDraft}
            />
        </div>
    );
};
