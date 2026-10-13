import { useState } from 'react';

// Drag & drop di settimane, giorni ed esercizi
export const useTrainingDragDrop = ({ setWeeks }) => {
    // --- STATI PER DRAG & DROP E COPIA ---
    const [draggedItem, setDraggedItem] = useState(null);
    const [clipboard, setClipboard] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);

    // --- LOGICA DRAG & DROP (Nesting Fix) ---
    const handleDragStart = (e, type, itemData) => {
        e.stopPropagation();
        setDraggedItem({ type, ...itemData });
        setTimeout(() => {
            e.target.style.opacity = '0.4';
        }, 0);
    };

    const handleDragEnd = (e) => {
        e.preventDefault();
        e.target.style.opacity = '1';
        setDraggedItem(null);
        setDragOverId(null);
    };

    const handleDragOver = (e, targetType, targetId) => {
        e.preventDefault();

        // Se sto trascinando una SETTIMANA ma passo sopra un GIORNO,
        // ignoro il giorno e faccio "salire" l'evento alla Settimana contenitore.
        if (draggedItem?.type === 'week' && targetType === 'day') {
            return;
        }

        // Se arrivo qui, l'azione è valida. Blocco l'evento per non far illuminare due cose insieme.
        e.stopPropagation();

        if (dragOverId !== targetId) {
            setDragOverId(targetId);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOverId(null);
    };

    const handleDrop = (e, targetType, targetData) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverId(null);

        if (!draggedItem) return;

        setWeeks((prev) => {
            const newWeeks = JSON.parse(JSON.stringify(prev));

            // 1. SPOSTAMENTO SETTIMANE
            if (draggedItem.type === 'week') {
                // Se lascio cadere per sbaglio su un giorno, capisce da solo qual è la settimana di quel giorno
                const dropWeekId = targetType === 'day' ? targetData.weekId : targetData.weekId;

                const dragIdx = newWeeks.findIndex((w) => w.id === draggedItem.weekId);
                const dropIdx = newWeeks.findIndex((w) => w.id === dropWeekId);

                if (dragIdx === -1 || dropIdx === -1 || dragIdx === dropIdx) return prev;

                const [movedWeek] = newWeeks.splice(dragIdx, 1);
                newWeeks.splice(dropIdx, 0, movedWeek);
            }
            // 2. SPOSTAMENTO GIORNI (Tra settimane diverse)
            else if (draggedItem.type === 'day') {
                const sourceWeekIdx = newWeeks.findIndex((w) => w.id === draggedItem.weekId);
                if (sourceWeekIdx === -1) return prev;

                const sourceWeek = newWeeks[sourceWeekIdx];
                const dragIdx = sourceWeek.days.findIndex((d) => d.id === draggedItem.dayId);
                if (dragIdx === -1) return prev;

                // CASO A: Rilascio il giorno ESATTAMENTE SOPRA un altro giorno
                if (targetType === 'day') {
                    const targetWeekIdx = newWeeks.findIndex((w) => w.id === targetData.weekId);
                    if (targetWeekIdx === -1) return prev;

                    const targetWeek = newWeeks[targetWeekIdx];
                    const dropIdx = targetWeek.days.findIndex((d) => d.id === targetData.dayId);

                    // Evita mosse a vuoto su se stesso
                    if (draggedItem.weekId === targetData.weekId && dragIdx === dropIdx) return prev;

                    const [movedDay] = sourceWeek.days.splice(dragIdx, 1);
                    targetWeek.days.splice(dropIdx, 0, movedDay);
                }
                // CASO B: Rilascio il giorno SULLA SETTIMANA (In fondo alla lista)
                else if (targetType === 'week') {
                    if (draggedItem.weekId === targetData.weekId) return prev; // Già in questa settimana

                    const targetWeekIdx = newWeeks.findIndex((w) => w.id === targetData.weekId);
                    if (targetWeekIdx === -1) return prev;

                    const [movedDay] = sourceWeek.days.splice(dragIdx, 1);
                    // Lo sposta nell'array dei giorni della nuova settimana
                    newWeeks[targetWeekIdx].days.push(movedDay);
                }
            }

            return newWeeks;
        });

        setDraggedItem(null);
    };

    return { dragOverId, setDragOverId, handleDragStart, handleDragEnd, handleDragOver, handleDrop };
};
