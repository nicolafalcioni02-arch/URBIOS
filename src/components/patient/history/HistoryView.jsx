import React, { useState, useMemo, useEffect } from 'react';
import { SmartPlotModal } from '../../charts/SmartPlotModal';
import { SearchCalendarModal } from './modals/SearchCalendarModal';
import { VisitDetailModal } from './modals/VisitDetailModal';
import { usePrintCenter } from '../../reports/printCenter/PrintCenterProvider';
import { Analisi } from '../../../views/analisi/Analisi';
import { DietPreviewModal } from './modals/DietPreviewModal';
import { HistoryStatsCards } from './sections/HistoryStatsCards';
import { HistoryToolbar } from './sections/HistoryToolbar';
import { VisitList } from './sections/VisitList';

// ─── Main Component ───────────────────────────────────────────────────────────
export const HistoryView = ({ patient, onUpdateDb, onOpenDiet }) => {
    const [showSmartPlot, setShowSmartPlot] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [isSearchCalendarOpen, setIsSearchCalendarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const printCenter = usePrintCenter();
    const [analisiVisit, setAnalisiVisit] = useState(null); // visita di cui si apre l'analisi avanzata
    const [dietVisit, setDietVisit] = useState(null); // visita di cui si guarda l'anteprima della dieta
    const [toDelete, setToDelete] = useState(null); // visita da eliminare, in attesa di conferma

    useEffect(() => {
        const closeMenu = () => setActiveMenu(null);
        if (activeMenu) document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, [activeMenu]);

    // ── Derived data ──────────────────────────────────────────────────────────
    const visite = patient?.visite || [];
    const sortedVisits = useMemo(() => [...visite].sort((a, b) => new Date(b.data) - new Date(a.data)), [patient?.visite]);

    const stats = useMemo(() => {
        if (!visite.length) return null;
        const asc = [...visite].sort((a, b) => new Date(a.data) - new Date(b.data));
        const first = asc[0];
        const last = asc[asc.length - 1];
        const delta = (last.peso - first.peso).toFixed(1);
        const avgDelta = visite.length > 1 ? (delta / (visite.length - 1)).toFixed(1) : null;
        return { startWeight: first.peso, currentWeight: last.peso, deltaPeso: delta, lastDate: last.data, avgDelta, totalVisits: visite.length };
    }, [patient?.visite]);

    const visitDates = useMemo(() => visite.map((v) => v.data), [patient?.visite]);

    // dati di una visita nel formato che servono ad Analisi e report grafici (peso a parte, età alla data della visita)
    const visitCtx = (visit) => {
        const det = visit.dettagli || {};
        const nascita = new Date(patient.dataNascita || visit.data);
        const at = new Date(visit.data);
        let eta = at.getFullYear() - nascita.getFullYear();
        if (at.getMonth() < nascita.getMonth() || (at.getMonth() === nascita.getMonth() && at.getDate() < nascita.getDate())) eta--;
        return { visitData: { ...det, peso: visit.peso ?? det.peso, data: visit.data }, eta, sesso: patient.sesso && patient.sesso.toUpperCase() === 'F' ? 'F' : 'M' };
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    // il confronto è sempre con la visita precedente nello storico completo, anche quando la lista è filtrata
    const getWeightDelta = (visit, _index, allVisits) => {
        const index = allVisits.findIndex((v) => v.id === visit.id);
        if (index === -1 || index === allVisits.length - 1) return null;
        const prev = allVisits[index + 1];
        const diff = (visit.peso - prev.peso).toFixed(1);
        return Number(diff);
    };

    // stessi stati di "Salva e Gestisci" (Dieta)
    const getDietBadge = (status) => {
        switch (status) {
            case 'created':
            case 'active':
                return { label: 'Piano Attivo', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
            case 'todo':
                return { label: 'Da Creare', color: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500' };
            case 'draft':
                return { label: 'Da Finire', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
            case 'pending':
                return { label: 'Da Inviare', color: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-600' };
            case 'delivery':
                return { label: 'Consegnato', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
            case 'edit':
                return { label: 'Da Modificare', color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' };
            default:
                return { label: 'Controllo', color: 'bg-gray-100 text-gray-500 border-gray-200', dot: 'bg-gray-400' };
        }
    };

    // conferma dentro l'app: confirm() del browser non funziona in tutte le finestre incorporate
    const handleDelete = (e, visit) => {
        e.stopPropagation();
        setToDelete(visit);
    };
    const confirmDelete = () => {
        const visitId = toDelete.id;
        onUpdateDb((prev) => ({
            ...prev,
            pazienti: prev.pazienti.map((p) => (p.id === patient.id ? { ...p, visite: p.visite.filter((v) => v.id !== visitId) } : p)),
        }));
        setToDelete(null);
    };

    // ── Filtered visits ───────────────────────────────────────────────────────
    const filteredVisits = sortedVisits.filter((v) => String(v.data).includes(searchTerm) || v.note?.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!stats) {
        return (
            <div className="p-20 text-center text-gray-400">
                <i className="ph ph-clock-counter-clockwise text-4xl mb-4"></i>
                <p>Nessuna visita registrata per questo paziente.</p>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="fade-enter max-w-5xl mx-auto pb-32 relative">
            {/* ── KPI CARDS ─────────────────────────────────────────────── */}
            <HistoryStatsCards stats={stats} />

            {/* ── ACTION BAR ────────────────────────────────────────────── */}
            <HistoryToolbar
                filteredVisits={filteredVisits}
                searchTerm={searchTerm}
                setIsSearchCalendarOpen={setIsSearchCalendarOpen}
                setSearchTerm={setSearchTerm}
                setShowSmartPlot={setShowSmartPlot}
            />

            {showSmartPlot && <SmartPlotModal patient={patient} onClose={() => setShowSmartPlot(false)} />}

            {/* ── VISITS TIMELINE ───────────────────────────────────────── */}
            <VisitList
                filteredVisits={filteredVisits}
                getDietBadge={getDietBadge}
                getWeightDelta={getWeightDelta}
                handleDelete={handleDelete}
                onOpenDiet={setDietVisit}
                setSearchTerm={setSearchTerm}
                setSelectedVisit={setSelectedVisit}
                sortedVisits={sortedVisits}
            />

            {/* ── SEARCH CALENDAR MODAL ─────────────────────────────────── */}
            {
                <SearchCalendarModal
                    isSearchCalendarOpen={isSearchCalendarOpen}
                    setIsSearchCalendarOpen={setIsSearchCalendarOpen}
                    setSearchTerm={setSearchTerm}
                    visitDates={visitDates}
                />
            }

            {/* ── VISIT DETAIL MODAL ────────────────────────────────────── */}
            {<VisitDetailModal
                selectedVisit={selectedVisit}
                setSelectedVisit={setSelectedVisit}
                onPrintCharts={
                    printCenter
                        ? (v) => {
                              setSelectedVisit(null);
                              printCenter.open([{ type: 'visita', visitId: v.id }, { type: 'grafici', visitId: v.id }]);
                          }
                        : null
                }
                onOpenAnalisi={(v) => {
                    setSelectedVisit(null);
                    setAnalisiVisit(v);
                }}
            />}
            {analisiVisit && (
                <Analisi
                    patient={patient}
                    visitData={visitCtx(analisiVisit).visitData}
                    report={analisiVisit.dettagli || {}}
                    sesso={visitCtx(analisiVisit).sesso}
                    eta={visitCtx(analisiVisit).eta}
                    visitId={analisiVisit.id}
                    onClose={() => setAnalisiVisit(null)}
                />
            )}

            <DietPreviewModal
                visit={dietVisit}
                onClose={() => setDietVisit(null)}
                onEdit={(v) => {
                    setDietVisit(null);
                    onOpenDiet && onOpenDiet(v.id);
                }}
            />

            {toDelete && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setToDelete(null)}>
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="font-black text-base text-gray-900">Eliminare la visita?</h3>
                        <p className="text-sm text-gray-500 mt-2">
                            La visita del {new Date(toDelete.data).toLocaleDateString('it-IT', { dateStyle: 'long' })} ({toDelete.peso} kg) verrà eliminata definitivamente, con tutto ciò che contiene.
                        </p>
                        <div className="flex justify-end gap-2 mt-5">
                            <button onClick={() => setToDelete(null)} className="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 transition-colors">
                                Annulla
                            </button>
                            <button onClick={confirmDelete} className="px-4 py-2 rounded-full text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors">
                                Elimina
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
