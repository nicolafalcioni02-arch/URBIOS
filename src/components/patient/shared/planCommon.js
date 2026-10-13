// Cose comuni ai piani di Dieta e Training: stati, date, identificatori.

export const genId = () => 'id-' + Math.random().toString(36).slice(2, 11);
export const todayIso = () => new Date().toLocaleDateString('en-CA');
export const fmtLong = (iso) => {
    const d = new Date(iso);
    return iso && !isNaN(d) ? d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
};

// Stati di un piano (gli stessi di "Salva e Gestisci" della Dieta; 'active'/'created' = attivo)
export const STATUSES = [
    { id: 'todo', label: 'Da creare', color: '#8E8E93', bg: '#EDEBE6', icon: 'ph-clock' },
    { id: 'draft', label: 'Da finire', color: '#B25E00', bg: '#FFF1D6', icon: 'ph-pencil-line' },
    { id: 'pending', label: 'Pronto da inviare', color: '#121317', bg: '#E6E4DE', icon: 'ph-paper-plane-tilt' },
    { id: 'delivery', label: 'Consegnato', color: '#1F6B49', bg: '#DCE9E1', icon: 'ph-check-circle' },
    { id: 'edit', label: 'Da modificare', color: '#8A1F11', bg: '#FDECEA', icon: 'ph-warning-octagon' },
    { id: 'active', label: 'Attivo', color: '#1F6B49', bg: '#DCE9E1', icon: 'ph-play-circle' },
];
export const statusById = (id) => STATUSES.find((x) => x.id === (id === 'created' ? 'active' : id)) || STATUSES[0];
