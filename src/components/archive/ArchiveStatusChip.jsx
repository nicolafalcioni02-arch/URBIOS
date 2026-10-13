import React, { useState } from 'react';
import { useArchive } from '../../storage/ArchiveProvider';

// Pastiglia sempre visibile in basso a sinistra: stato del salvataggio e pulsante "Salva".
export const ArchiveStatusChip = () => {
    const { dirty, ephemeral, encrypted, lastSavedAt, saveFile } = useArchive();
    const [busy, setBusy] = useState(false);

    if (ephemeral) {
        return (
            <div className="archive-chip fixed bottom-3 left-3 z-[900] bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-sm">
                Demo · nulla viene salvato
            </div>
        );
    }

    const onSave = async () => {
        setBusy(true);
        try {
            await saveFile();
        } catch (e) {
            alert('Salvataggio non riuscito: ' + (e.message || e));
        }
        setBusy(false);
    };

    const time = lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : null;

    return (
        <button
            onClick={onSave}
            disabled={busy}
            title={dirty ? 'Modifiche non salvate nel file: clicca per salvare' : 'Tutto salvato nel file'}
            className={`archive-chip fixed bottom-3 left-3 z-[900] flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-bold shadow-md border transition-all print:hidden ${
                dirty ? 'bg-red-50 border-red-200 text-red-700 animate-pulse' : 'bg-white border-gray-200 text-gray-500'
            }`}
        >
            <span className={`w-2 h-2 rounded-full ${dirty ? 'bg-red-500' : 'bg-green-500'}`}></span>
            {encrypted && <i className="ph-fill ph-lock-key text-sm"></i>}
            {busy ? 'Salvataggio…' : dirty ? 'Non salvato · Salva ora' : `Salvato${time ? ' alle ' + time : ''}`}
        </button>
    );
};
