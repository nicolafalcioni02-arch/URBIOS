import React, { useState, useMemo, useEffect } from 'react';
import { SmartPlotModal } from '../../charts/SmartPlotModal';
import { SearchCalendarModal } from './modals/SearchCalendarModal';
import { VisitDetailModal } from './modals/VisitDetailModal';
import { HistoryStatsCards } from './sections/HistoryStatsCards';
import { HistoryToolbar } from './sections/HistoryToolbar';
import { VisitList } from './sections/VisitList';

// ─── Main Component ───────────────────────────────────────────────────────────
export const HistoryView = ({ patient, onUpdateDb }) => {
    const [showSmartPlot, setShowSmartPlot] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [isSearchCalendarOpen, setIsSearchCalendarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const closeMenu = () => setActiveMenu(null);
        if (activeMenu) document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, [activeMenu]);

    if (!patient || !patient.visite || patient.visite.length === 0) {
        return (
            <div className="p-20 text-center text-gray-400">
                <i className="ph ph-clock-counter-clockwise text-4xl mb-4"></i>
                <p>Nessuna visita registrata per questo paziente.</p>
            </div>
        );
    }

    // ── Derived data ──────────────────────────────────────────────────────────
    const sortedVisits = useMemo(() => [...patient.visite].sort((a, b) => new Date(b.data) - new Date(a.data)), [patient.visite]);

    const stats = useMemo(() => {
        const asc = [...patient.visite].sort((a, b) => new Date(a.data) - new Date(b.data));
        const first = asc[0];
        const last = asc[asc.length - 1];
        const delta = (last.peso - first.peso).toFixed(1);
        const avgDelta = patient.visite.length > 1 ? (delta / (patient.visite.length - 1)).toFixed(1) : null;
        return { startWeight: first.peso, currentWeight: last.peso, deltaPeso: delta, lastDate: last.data, avgDelta, totalVisits: patient.visite.length };
    }, [patient.visite]);

    const visitDates = useMemo(() => patient.visite.map((v) => v.data), [patient.visite]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getWeightDelta = (visit, index, allVisits) => {
        if (index === allVisits.length - 1) return null;
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

    const handleDelete = (e, visitId) => {
        e.stopPropagation();
        if (confirm('Sei sicuro di voler eliminare definitivamente questa visita?')) {
            onUpdateDb((prev) => ({
                ...prev,
                pazienti: prev.pazienti.map((p) => (p.id === patient.id ? { ...p, visite: p.visite.filter((v) => v.id !== visitId) } : p)),
            }));
        }
    };

    // ── Filtered visits ───────────────────────────────────────────────────────
    const filteredVisits = sortedVisits.filter((v) => v.data.includes(searchTerm) || v.note?.toLowerCase().includes(searchTerm.toLowerCase()));

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
            {<VisitDetailModal selectedVisit={selectedVisit} setSelectedVisit={setSelectedVisit} />}
        </div>
    );
};
