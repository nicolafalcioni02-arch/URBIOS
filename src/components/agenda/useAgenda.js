// Appuntamenti condivisi da vista Agenda, widget Appuntamenti e widget Calendario: stanno tutti in db.agenda.
import { useCallback, useMemo } from 'react';
import { agendaSettings, startOf } from './agendaLogic';

export const useAgenda = (db, onUpdateDb) => {
    const items = useMemo(() => (Array.isArray(db && db.agenda) ? db.agenda : []), [db]);
    const settings = useMemo(() => agendaSettings((db && db.utente) || {}), [db]);

    const save = useCallback(
        (appt) =>
            onUpdateDb((prev) => {
                const list = Array.isArray(prev.agenda) ? prev.agenda : [];
                const i = list.findIndex((x) => x.id === appt.id);
                const next = i >= 0 ? list.map((x) => (x.id === appt.id ? appt : x)) : [...list, appt];
                next.sort((a, b) => startOf(a) - startOf(b));
                return { ...prev, agenda: next };
            }),
        [onUpdateDb]
    );
    const remove = useCallback((id) => onUpdateDb((prev) => ({ ...prev, agenda: (prev.agenda || []).filter((x) => x.id !== id) })), [onUpdateDb]);
    return { items, settings, save, remove };
};
