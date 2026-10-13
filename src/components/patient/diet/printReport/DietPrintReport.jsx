import React from 'react';
import ReactDOM from 'react-dom';
import { chunkArray } from './logic/printLayout';
import { printCss } from './printStyles';
import { CoverSheet } from './sheets/CoverSheet';
import { DailySheets } from './sheets/DailySheets';
import { FinalSheet } from './sheets/FinalSheet';
import { PrintToolbar } from './sheets/PrintToolbar';
import { SettingsSheet } from './sheets/SettingsSheet';
import { ShoppingListSheets } from './sheets/ShoppingListSheets';

// --- COMPONENTE DI STAMPA REPORT DIETA COMPLETO ---
// --- COMPONENTE DI STAMPA REPORT DIETA COMPLETO ---
// --- COMPONENTE DI STAMPA DIRETTA (STEALTH PRINT) ---
// --- COMPONENTE DI STAMPA DIRETTA (STEALTH PRINT) ---
// --- COMPONENTE DI STAMPA DIRETTA (STEALTH PRINT PREMIUM) ---
// --- COMPONENTE DI STAMPA DIRETTA (STEALTH PRINT PREMIUM - IMPAGINAZIONE AVANZATA) ---
// --- COMPONENTE EDITOR A4 INTERATTIVO E STAMPA ---
// --- COMPONENTE EDITOR A4 (IMPAGINAZIONE A FOGLI RIGIDI MULTIPLI) ---
export const DietPrintReport = ({ patient, professionalData, dietDays, targets, savedReports, issueDate, onClose }) => {
    // 2. Calcoli per Lista della Spesa
    const generateShoppingList = () => {
        const list = {};
        dietDays.forEach((day) => {
            day.meals.forEach((meal) => {
                meal.items.forEach((item) => {
                    if (item.name && item.weight) {
                        if (!list[item.name]) list[item.name] = 0;
                        list[item.name] += Number(item.weight);
                    }
                });
            });
        });
        return Object.entries(list).sort((a, b) => a[0].localeCompare(b[0]));
    };
    const shoppingList = generateShoppingList();

    // Dividiamo la spesa in blocchi da 36 elementi (18 per colonna) per foglio
    const shoppingListChunks = chunkArray(shoppingList, 36);

    const targetGrams = {
        c: targets?.isConfigured ? (targets.kcal * targets.c) / 400 : 0,
        p: targets?.isConfigured ? (targets.kcal * targets.p) / 400 : 0,
        f: targets?.isConfigured ? (targets.kcal * targets.f) / 900 : 0,
    };

    // data del piano scelta dal professionista; '' = senza data (non viene stampata)
    const today = issueDate !== undefined ? issueDate : new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    const prof = professionalData || {
        nome: 'Dott. Rossi',
        titolo_professionale: 'Biologo Nutrizionista',
        indirizzo_studio: 'Via Roma 1',
        citta_studio: 'Milano (MI)',
        numero_albo: 'AA_012345',
        p_iva: '12345678901',
    };

    const fullDisclaimer =
        "Il presente documento riporta un piano nutrizionale strettamente personale, elaborato sulla base delle caratteristiche fisiologiche, antropometriche e/o patologiche del soggetto in esame. Il documento non può essere ceduto a terzi. Le indicazioni fornite hanno scopo nutrizionale e non sostituiscono in alcun caso il parere del medico curante. Eventuali variazioni allo stato di salute o terapie farmacologiche in corso devono essere tempestivamente comunicate al professionista. Si declina ogni responsabilità per un uso improprio o per l'autonoma alterazione di questo piano.";

    // 3. Stile flessibile per far calcolare i blocchi al browser
    const a4Style = {
        width: '210mm',
        minHeight: '297mm',
        height: '297mm',
        background: 'white',
        margin: '30px auto',
        padding: '20mm',
        boxSizing: 'border-box',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', sans-serif",
        color: '#000',
        pageBreakAfter: 'always',
        paddingBottom: '90px', // margine di 30px dal basso
    };

    const printContent = (
        <div id="interactive-editor-overlay" style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#323639', overflowY: 'auto' }}>
            {/* TOOLBAR */}
            <PrintToolbar onClose={onClose} />

            <div id="a4-sheets-container">
                {/* --- FOGLIO 1: COPERTINA --- */}
                <CoverSheet a4Style={a4Style} patient={patient} prof={prof} today={today} />

                {/* --- FOGLIO 2: IMPOSTAZIONI --- */}
                <SettingsSheet a4Style={a4Style} savedReports={savedReports} targetGrams={targetGrams} targets={targets} />

                {/* --- FOGLI GIORNALIERI (CON GENERAZIONE AUTOMATICA DEI SOTTO-FOGLI) --- */}
                {/* --- FOGLI GIORNALIERI (Paginazione Automatica a Blocchi) --- */}
                {/* --- FOGLI GIORNALIERI (A blocchi dinamici basati su spazio) --- */}
                {<DailySheets a4Style={a4Style} dietDays={dietDays} />}

                {/* --- FOGLI: LISTA DELLA SPESA (Multi-pagina se sfora) --- */}
                {<ShoppingListSheets a4Style={a4Style} shoppingListChunks={shoppingListChunks} />}

                {/* --- FOGLIO FINALE: MISURAZIONI E PEDICE --- */}
                <FinalSheet a4Style={a4Style} fullDisclaimer={fullDisclaimer} prof={prof} />
            </div>

            {/* STILI PER LA CORRETTA IMPAGINAZIONE */}
            <style>{printCss}</style>
        </div>
    );

    return ReactDOM.createPortal(printContent, document.body);
};
