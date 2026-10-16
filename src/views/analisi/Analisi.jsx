import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Somatocarta } from '../../components/charts/somatocarta/Somatocarta';
import { generateAdvancedInterpretation } from './logic/somatotypeInterpretation';
import { ConfirmSaveModal } from './modals/ConfirmSaveModal';
import { AnalisiHeader } from './sections/AnalisiHeader';
import { usePrintCenter } from '../../components/reports/printCenter/PrintCenterProvider';
import { computeSomatotype } from './logic/somatotype';
import { buildBodyModel } from './logic/bodyModel';
import { getComposition } from './logic/composition';
import { Body3D } from './sections/Body3D';
import { BodyCompositionCharts } from './sections/BodyCompositionCharts';

export const Analisi = ({ onClose, patient, visitData, updateDraft, report, sesso, eta, visitId = null }) => {
    // --- STATI ---
    const [somatoValues, setSomatoValues] = useState({ endo: 0, meso: 0, ecto: 0 });
    const [tab, setTab] = useState('comp');
    const [layer3d, setLayer3d] = useState('circ');
    const printCenter = usePrintCenter();
    const [interpretationText, setInterpretationText] = useState('');

    // Stati per UI di Salvataggio
    const [showSaveAlert, setShowSaveAlert] = useState(false); // Banner verde successo
    const [showConfirmModal, setShowConfirmModal] = useState(false); // Modale di conferma

    // =================================================================================
    // FINE ALGORITMO
    // =================================================================================

    // --- CARICAMENTO DATI ---
    useEffect(() => {
        if (!visitData) return;
        const savedInterpretation = visitData.somatotipo_interpretazione || '';
        const calculatedValues = computeSomatotype(visitData);

        setSomatoValues(calculatedValues);

        if (!savedInterpretation) {
            setInterpretationText(generateAdvancedInterpretation(calculatedValues.endo, calculatedValues.meso, calculatedValues.ecto));
        } else {
            setInterpretationText(savedInterpretation);
        }
    }, [visitData]);

    // --- GESTORI ---
    const handleManualChange = (field, value) => {
        const newVal = parseFloat(value) || 0;
        const newValues = { ...somatoValues, [field]: newVal };
        setSomatoValues(newValues);
        setInterpretationText(generateAdvancedInterpretation(newValues.endo, newValues.meso, newValues.ecto));
    };

    // Questo viene chiamato quando clicchi "Conferma" nel modale
    const executeSave = () => {
        if (updateDraft) {
            updateDraft('somatotipo_interpretazione', interpretationText);
            updateDraft('somatotipo_valori', somatoValues);

            setShowConfirmModal(false); // Chiudi modale conferma
            setShowSaveAlert(true); // Mostra successo
            setTimeout(() => setShowSaveAlert(false), 3000);
        } else {
            alert('Errore tecnico: Funzione di salvataggio mancante.');
        }
    };

    // --- STATO DATI BIA ---
    // Qui gestiamo i dati che l'utente inserisce e che passiamo al grafico
    const [biaData, setBiaData] = useState({
        rz: 450,
        xc: 55,
        pha: 6.9, // Angolo di fase
        weight: 75.5,
        height: 175, // Questo dovrebbe arrivare dall'Anamnesi, qui lo metto hardcoded per test
    });

    // --- CALCOLO AUTOMATICO ANGOLO DI FASE ---
    // Ogni volta che Rz o Xc cambiano, ricalcoliamo PhA
    useEffect(() => {
        if (biaData.rz > 0 && biaData.xc > 0) {
            const phaRad = Math.atan(biaData.xc / biaData.rz);
            const phaDeg = phaRad * (180 / Math.PI);
            setBiaData((prev) => ({ ...prev, pha: phaDeg.toFixed(1) }));
        }
    }, [biaData.rz, biaData.xc]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBiaData((prev) => ({
            ...prev,
            [name]: parseFloat(value) || 0, // Gestiamo input numerici
        }));
    };

    const model = buildBodyModel(visitData, report, sesso);
    const comp = getComposition(visitData || {}, report || {}, sesso, eta);

    return ReactDOM.createPortal(
        <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 fade-enter">
            <div style={{ background: '#F6F5F2' }} className="w-full max-w-[1680px] h-full sm:h-[95vh] rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-gray-200">
                {/* --- HEADER --- */}
                <AnalisiHeader onClose={onClose} patient={patient} />

                {/* --- CORPO PRINCIPALE --- */}
                <div className="flex-1 p-3 sm:p-5 overflow-y-auto lg:overflow-hidden">
                    <div className="flex flex-col lg:flex-row gap-4 lg:h-full">
                        {/* Colonna sinistra: modello 3D che segue le misure */}
                        <aside className="lg:w-[400px] xl:w-[460px] flex-none bg-white rounded-2xl border border-stone-200 flex flex-col overflow-hidden h-[520px] lg:h-full">
                            <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-[13px] font-bold text-stone-900">Modello corporeo</div>
                                    <div className="text-[11px] text-stone-500 truncate">
                                        {model.altezza ? `${model.altezza} cm` : '-- cm'} · {model.peso ? `${model.peso} kg` : '-- kg'}
                                        {comp.fm > 0 ? ` · ${comp.fm.toFixed(1).replace('.', ',')}% grasso` : ''}
                                    </div>
                                </div>
                                <div className="flex p-0.5 rounded-full bg-stone-100 flex-none">
                                    {[['circ', 'Circonferenze'], ['pliche', 'Pliche']].map(([id, l]) => (
                                        <button key={id} onClick={() => setLayer3d(id)} className={`px-3 h-7 rounded-full text-[11px] font-bold transition-colors ${layer3d === id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}>
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 min-h-0">
                                <Body3D model={model} showRings={layer3d === 'circ'} showPliche={layer3d === 'pliche'} />
                            </div>
                            <div className="px-4 py-2.5 border-t border-stone-100 text-[11px] text-stone-500 leading-snug flex gap-2">
                                <i className="ph ph-hand-grabbing text-[14px] mt-px flex-none"></i>
                                <span>
                                    {layer3d === 'circ'
                                        ? 'Il corpo prende la forma delle misure. La vita è verde, gialla o rossa in base al rapporto vita/altezza.'
                                        : 'Ogni sfera è un punto di plica: più è grande, più la plica è spessa.'}{' '}
                                    Trascina per ruotare.
                                </span>
                            </div>
                        </aside>

                        {/* Colonna destra: schede */}
                        <div className="flex-1 min-w-0 flex flex-col gap-3 lg:h-full">
                            <div className="flex flex-wrap items-center gap-2 flex-none">
                            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 self-start flex-none">
                                {[['comp', 'Composizione corporea', 'ph-chart-pie-slice'], ['somato', 'Somatotipo', 'ph-triangle']].map(([id, label, ic]) => (
                                    <button key={id} onClick={() => setTab(id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${tab === id ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                                        <i className={`ph-bold ${ic}`}></i>{label}
                                    </button>
                                ))}
                            </div>
                            {printCenter && <button onClick={() => printCenter.open([{ type: 'grafici', visitId: visitId || 'draft' }])} className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5">
                                <i className="ph-bold ph-printer"></i> Stampa grafici A4
                            </button>}
                            </div>
                            <div className="flex-1 min-h-0 lg:overflow-y-auto pr-1 pb-6">
                        {tab === 'comp' && <BodyCompositionCharts visitData={visitData} report={report} sesso={sesso} eta={eta} patient={patient} date={visitData?.data} />}
                        {tab === 'somato' && (<>
                        {/* ============================================================ */}
                        {/* SUPER BOX 1: SOMATOTIPO (GRAFICO SX + INPUT/TESTO DX)        */}
                        {/* ============================================================ */}
                        <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-200">
                            {/* Titolo Sezione */}
                            <div className="w-full flex flex-wrap justify-between items-center gap-3 mb-6 sm:mb-8 border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                                        <i className="ph-fill ph-triangle text-2xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-xl">Somatotipo</h3>
                                        <p className="text-xs text-gray-400 font-bold ">Heath-Carter Method</p>
                                    </div>
                                </div>
                                {/* Pulsante Salva (Apre il Modale): non c'è quando l'analisi è aperta dallo storico, in sola lettura */}
                                {updateDraft && <button
                                    onClick={() => setShowConfirmModal(true)}
                                    className="group flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-95"
                                >
                                    <i className="ph-bold ph-floppy-disk text-lg"></i>
                                    <span>Salva Referto Somatotipo</span>
                                </button>}
                            </div>

                            {/* Banner Successo (Post-Salvataggio) */}
                            {showSaveAlert && (
                                <div className="mb-6 bg-green-50 text-green-700 px-4 py-3 rounded-xl border border-green-200 flex items-center gap-3 animate-fade-in-down">
                                    <i className="ph-fill ph-check-circle text-xl"></i>
                                    <div>
                                        <p className="font-bold text-sm">Referto Salvato Correttamente!</p>
                                        <p className="text-xs opacity-80">I dati sono stati aggiornati nello storico della visita corrente.</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-12">
                                {/* --- COLONNA SINISTRA: GRAFICO --- */}
                                <div className="flex items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-100 p-4">
                                    <Somatocarta endo={somatoValues.endo} meso={somatoValues.meso} ecto={somatoValues.ecto} />
                                </div>

                                {/* --- COLONNA DESTRA: INPUT & REPORT --- */}
                                <div className="flex flex-col h-full">
                                    {/* 1. Input Modificabili */}
                                    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                                        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex flex-col items-center hover:border-rose-300 transition-colors group">
                                            <label className="text-xs font-semibold text-rose-400 mb-1 ">Endo</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="w-full text-center bg-transparent text-3xl font-black text-rose-600 outline-none group-hover:scale-110 transition-transform"
                                                value={somatoValues.endo.toFixed(1)}
                                                onChange={(e) => handleManualChange('endo', e.target.value)}
                                            />
                                        </div>
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center hover:border-emerald-300 transition-colors group">
                                            <label className="text-xs font-semibold text-emerald-400 mb-1 ">Meso</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="w-full text-center bg-transparent text-3xl font-black text-emerald-600 outline-none group-hover:scale-110 transition-transform"
                                                value={somatoValues.meso.toFixed(1)}
                                                onChange={(e) => handleManualChange('meso', e.target.value)}
                                            />
                                        </div>
                                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col items-center hover:border-blue-300 transition-colors group">
                                            <label className="text-xs font-semibold text-blue-400 mb-1 ">Ecto</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="w-full text-center bg-transparent text-3xl font-black text-blue-600 outline-none group-hover:scale-110 transition-transform"
                                                value={somatoValues.ecto.toFixed(1)}
                                                onChange={(e) => handleManualChange('ecto', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* 2. Generatore Report */}
                                    <div className="flex-1 flex flex-col">
                                        <label className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-2">
                                            <i className="ph-fill ph-article"></i> Referto Clinico Automatico
                                        </label>
                                        <div className="flex-1 bg-white rounded-2xl p-1 border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-inner h-full min-h-[300px]">
                                            <textarea
                                                className="w-full h-full bg-transparent border-none outline-none resize-none text-sm text-gray-700 leading-relaxed font-mono p-4"
                                                value={interpretationText}
                                                onChange={(e) => setInterpretationText(e.target.value)}
                                                placeholder="Il referto verrà generato qui..."
                                                style={{ whiteSpace: 'pre-wrap' }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-2 text-right">
                                            Modifica i valori numerici per rigenerare il testo automaticamente.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        </>)}
                            </div>
                        </div>
                        {/* --- MODALE CONFERMA SALVATAGGIO --- */}
                        {<ConfirmSaveModal executeSave={executeSave} setShowConfirmModal={setShowConfirmModal} showConfirmModal={showConfirmModal} />}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
