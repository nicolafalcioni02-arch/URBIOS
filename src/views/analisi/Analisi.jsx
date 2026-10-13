import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Somatocarta } from '../../components/charts/somatocarta/Somatocarta';
import { generateAdvancedInterpretation } from './logic/somatotypeInterpretation';
import { ConfirmSaveModal } from './modals/ConfirmSaveModal';
import { AnalisiHeader } from './sections/AnalisiHeader';

export const Analisi = ({ onClose, patient, visitData, updateDraft }) => {
    // --- STATI ---
    const [somatoValues, setSomatoValues] = useState({ endo: 0, meso: 0, ecto: 0 });
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
        const getVal = (k) => parseFloat(String(visitData[k] || '0').replace(',', '.')) || 0;

        // Recupero dati
        const peso = getVal('peso');
        const altezza = getVal('altezza');
        const tricipite = getVal('pl_tricipite');
        const sottoscap = getVal('pl_sottoscap');
        const sovrailiaca = getVal('pl_sovrailiaca');
        const polpaccioPl = getVal('pl_polpaccio');
        const omero = getVal('dm_omero') / 10;
        const femore = getVal('dm_femore') / 10;
        const braccio = getVal('circ_braccio_flesso') || getVal('circ_braccio');
        const polpaccio = getVal('circ_polpaccio');

        const sommaPliche = tricipite + sottoscap + sovrailiaca;
        let endo = 0,
            meso = 0,
            ecto = 0;

        if (altezza > 0 && sommaPliche > 0) {
            const X = sommaPliche * (170.18 / altezza);
            endo = -0.7182 + 0.1451 * X - 0.00068 * Math.pow(X, 2) + 0.0000014 * Math.pow(X, 3);
        }
        if (altezza > 0) {
            const braccioCorr = braccio - tricipite / 10;
            const polpaccioCorr = polpaccio - polpaccioPl / 10;
            meso = 0.858 * omero + 0.601 * femore + 0.188 * braccioCorr + 0.161 * polpaccioCorr - 0.131 * altezza + 4.5;
        }
        if (peso > 0 && altezza > 0) {
            const hwr = altezza / Math.pow(peso, 0.3333);
            if (hwr >= 40.75) ecto = 0.732 * hwr - 28.58;
            else if (hwr > 38.25) ecto = 0.463 * hwr - 17.63;
            else ecto = 0.1;
        }

        const calculatedValues = {
            endo: Math.max(0.1, endo),
            meso: Math.max(0.1, meso),
            ecto: Math.max(0.1, ecto),
        };

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

    return ReactDOM.createPortal(
        <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 fade-enter">
            <div className="bg-gray-50 w-full max-w-[1600px] h-full sm:h-[95vh] rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-gray-200">
                {/* --- HEADER --- */}
                <AnalisiHeader onClose={onClose} patient={patient} />

                {/* --- CORPO PRINCIPALE --- */}
                <div className="flex-1 p-3 sm:p-8 overflow-y-auto">
                    <div className="flex flex-col gap-8 pb-20">
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
                                {/* Pulsante Salva (Apre il Modale) */}
                                <button
                                    onClick={() => setShowConfirmModal(true)}
                                    className="group flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 active:scale-95"
                                >
                                    <i className="ph-bold ph-floppy-disk text-lg"></i>
                                    <span>Salva Referto Somatotipo</span>
                                </button>
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
                                        <p className="text-[10px] text-gray-400 mt-2 text-right italic">
                                            Modifica i valori numerici per rigenerare il testo automaticamente.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ============================================================ */}
                        {/* SUPER BOX 2: BIVA (Segnaposto)                               */}
                        {/* ============================================================ */}

                        {/* --- MODALE CONFERMA SALVATAGGIO --- */}
                        {<ConfirmSaveModal executeSave={executeSave} setShowConfirmModal={setShowConfirmModal} showConfirmModal={showConfirmModal} />}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
