import { useState, useEffect, useRef } from 'react';
import { WidgetDock } from '../../components/widgets/WidgetDock';
import { PatientHeader } from './parts/PatientHeader';
import { PatientTabContent } from './parts/PatientTabContent';
import { UrbiosAiModal } from '../../ai/UrbiosAiModal';
import { usePatientVisitActions } from './hooks/usePatientVisitActions';
import { PrintCenterProvider, usePrintCenter } from '../../components/reports/printCenter/PrintCenterProvider';

export const PatientDetail = ({ patient, onBack, onUpdateDb, db, readOnly = false, onOpenAgenda }) => {
    // un paziente senza visite parte dall'anagrafica, gli altri dallo storico
    const [view, setView] = useState(patient?.visite?.length ? 'history' : 'info');
    const [status, setStatus] = useState(patient?.status || 'Attivo');
    const [dietViewMode, setDietViewMode] = useState('menu');
    // Dieta e Training si modificano dentro Nuova visita: le tab aprono il percorso gia' sul piano giusto
    const [visitStart, setVisitStart] = useState(null);
    // visita su cui aprire la dieta (dallo Storico); null = la piu' recente
    const [visitStartId, setVisitStartId] = useState(null);
    // cambia solo quando un percorso comincia o finisce: nel frattempo Nuova visita resta com'e' anche se si guarda altro
    const [visitKey, setVisitKey] = useState(0);
    const [aiOpen, setAiOpen] = useState(false);
    const [widgetsEditing, setWidgetsEditing] = useState(false);
    const [headTop, setHeadTop] = useState(72);
    const headRef = useRef(null);
    const widgetsHidden = !!(db && db.widgets && db.widgets.hidePatient);
    const canWidgets = !readOnly; // i casi dimostrativi non toccano il db

    // le colonne dei widget partono sotto l'intestazione, qualunque altezza abbia
    useEffect(() => {
        const el = headRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return undefined;
        const ro = new ResizeObserver(() => setHeadTop(el.offsetHeight + 8));
        ro.observe(el);
        setHeadTop(el.offsetHeight + 8);
        return () => ro.disconnect();
    }, []);
    const toggleHidden = () => {
        setWidgetsEditing(false);
        onUpdateDb((prev) => ({ ...prev, widgets: { ...(prev.widgets || {}), hidePatient: !(prev.widgets && prev.widgets.hidePatient) } }));
    };

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

    const goTab = (id, visitId = null) => {
        const plan = id === 'diet' ? 'dieta' : id === 'Allenamento' ? 'training' : null;
        if (plan && patient?.visite?.length) {
            setVisitStart(plan);
            setVisitStartId(visitId);
            setVisitKey((k) => k + 1);
            setView('visit');
        } else {
            setView(id);
        }
    };

    const { updateDraft, updateDraftMany, updatePatientInfo, updatePatientMany, handleFinalizeVisit } = usePatientVisitActions({
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
        <PrintCenterProvider patient={patient} db={db} onUpdateDb={onUpdateDb} readOnly={readOnly}>
        <div className="h-full flex flex-col bg-[var(--paper)] relative z-20">
            {/* HEADER */}
            <div ref={headRef}>
                <PatientHeader
                    onBack={onBack}
                    patient={patient}
                    setView={goTab}
                    status={status}
                    view={view}
                    readOnly={readOnly}
                    onAi={() => setAiOpen(true)}
                    widgets={canWidgets ? { editing: widgetsEditing, hidden: widgetsHidden, toggleEdit: () => setWidgetsEditing((v) => !v), toggleHidden } : null}
                    printButton={<PrintButton />}
                />
            </div>
            {canWidgets && <WidgetDock db={db} onUpdateDb={onUpdateDb} mode="patient" top={headTop} hidden={widgetsHidden} editing={widgetsEditing} onEditingChange={setWidgetsEditing} onOpenAgenda={onOpenAgenda} />}

            <PatientTabContent
                configA={configA}
                configB={configB}
                db={db}
                dietViewMode={dietViewMode}
                handleFinalizeVisit={handleFinalizeVisit}
                updateDraftMany={updateDraftMany}
                visitStart={visitStart}
                visitStartId={visitStartId}
                onDone={() => {
                    setVisitStart(null);
                    setVisitKey((k) => k + 1);
                    setView('history');
                }}
                visitKey={visitKey}
                onUpdateDb={onUpdateDb}
                onOpenDiet={(visitId) => goTab('diet', visitId)}
                patient={patient}
                setConfigA={setConfigA}
                setConfigB={setConfigB}
                setDietViewMode={setDietViewMode}
                updateDraft={updateDraft}
                updatePatientInfo={updatePatientInfo}
                view={view}
                visitDraft={visitDraft}
                widgetsPad={canWidgets && !widgetsHidden}
            />

            {aiOpen && (
                <UrbiosAiModal
                    patient={patient}
                    visitDraft={visitDraft}
                    db={db}
                    onClose={() => setAiOpen(false)}
                    onApplyPatient={updatePatientMany}
                    onApplyDraft={updateDraftMany}
                    onGoVisit={() => setView('visit')}
                    onGoTraining={() => goTab('Allenamento')}
                    onGoDiet={() => goTab('diet')}
                />
            )}
        </div>
        </PrintCenterProvider>
    );
};

// tasto stampante nella barra in alto: apre il Centro stampa
const PrintButton = () => {
    const pc = usePrintCenter();
    if (!pc) return null;
    return (
        <button className="vw-chip !px-0 w-10 !h-10 justify-center flex-none" onClick={() => pc.open()} title="Centro stampa: tutti i documenti del paziente, pronti da stampare o inviare" aria-label="Centro stampa">
            <i className="ph ph-printer"></i>
        </button>
    );
};
