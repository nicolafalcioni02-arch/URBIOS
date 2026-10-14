import React from 'react';
import { chunkArray } from './logic/printLayout';
import { CoverSheet } from './sheets/CoverSheet';
import { DailySheets } from './sheets/DailySheets';
import { FinalSheet } from './sheets/FinalSheet';
import { SettingsSheet } from './sheets/SettingsSheet';
import { ShoppingListSheets } from './sheets/ShoppingListSheets';

const FULL_DISCLAIMER =
    "Il presente documento riporta un piano nutrizionale strettamente personale, elaborato sulla base delle caratteristiche fisiologiche, antropometriche e/o patologiche del soggetto in esame. Il documento non può essere ceduto a terzi. Le indicazioni fornite hanno scopo nutrizionale e non sostituiscono in alcun caso il parere del medico curante. Eventuali variazioni allo stato di salute o terapie farmacologiche in corso devono essere tempestivamente comunicate al professionista. Si declina ogni responsabilità per un uso improprio o per l'autonoma alterazione di questo piano.";

// i fogli scorrono nel documento: l'altezza la decide il contenuto, ogni foglio inizia su una pagina nuova
const flowSheetStyle = {
    background: 'white',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', sans-serif",
    color: '#000',
    breakBefore: 'page',
    pageBreakBefore: 'always',
};

const shoppingListOf = (dietDays) => {
    const list = {};
    dietDays.forEach((day) => day.meals.forEach((meal) => meal.items.forEach((item) => {
        if (item.name && item.weight) list[item.name] = (list[item.name] || 0) + Number(item.weight);
    })));
    return Object.entries(list).sort((a, b) => a[0].localeCompare(b[0]));
};

// Fascicolo nutrizionale (copertina, impostazioni, giorni, spesa, pagina finale); senza hook, quindi rendibile in HTML statico
export const DietDocBody = ({ patient, professionalData, dietDays, targets, savedReports, issueDate }) => {
    const shoppingListChunks = chunkArray(shoppingListOf(dietDays), 36);
    const targetGrams = {
        c: targets?.isConfigured ? (targets.kcal * targets.c) / 400 : 0,
        p: targets?.isConfigured ? (targets.kcal * targets.p) / 400 : 0,
        f: targets?.isConfigured ? (targets.kcal * targets.f) / 900 : 0,
    };
    // data scelta dal professionista; '' = senza data (non viene stampata)
    const today = issueDate !== undefined ? issueDate : new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    const prof = professionalData || {};

    return (
        <>
            <CoverSheet a4Style={{ ...flowSheetStyle, breakBefore: 'auto', pageBreakBefore: 'auto' }} patient={patient} prof={prof} today={today} />
            <SettingsSheet a4Style={flowSheetStyle} savedReports={savedReports} targetGrams={targetGrams} targets={targets} />
            <DailySheets a4Style={flowSheetStyle} dietDays={dietDays} />
            <ShoppingListSheets a4Style={flowSheetStyle} shoppingListChunks={shoppingListChunks} />
            <FinalSheet a4Style={flowSheetStyle} fullDisclaimer={FULL_DISCLAIMER} prof={prof} />
        </>
    );
};
