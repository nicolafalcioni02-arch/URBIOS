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
import { isIndependent } from '../diet/guided/guidedLogic';
import { statusById } from '../shared/planCommon';

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
    const [swap, setSwap] = useState(null); // 'fwd' | 'back' mentre si passa da dettaglio a piano (e ritorno): niente lampo, scorre solo il contenuto
    const [dietFromDetail, setDietFromDetail] = useState(false); // l'anteprima è stata aperta dal dettaglio della visita: la freccia indietro ci torna
    const [toDelete, setToDelete] = useState(null); // visita da eliminare, in attesa di conferma

    useEffect(() => {
        const closeMenu = () => setActiveMenu(null);
        if (activeMenu) document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, [activeMenu]);

    // ── Derived data ──────────────────────────────────────────────────────────
    const visite = patient?.visite || [];
    const sortedVisits = useMemo(() => [...visite].sort((a, b) => new Date(b.data) - new Date(a.data)), [patient?.visite]);

    // le visite "Solo Dieta" hanno un peso segnaposto: per peso, andamento e curva contano solo le visite misurate
    const measured = useMemo(() => visite.filter((v) => !isIndependent(v)), [patient?.visite]);

    const stats = useMemo(() => {
        if (!visite.length) return null;
        const asc = [...measured].sort((a, b) => new Date(a.data) - new Date(b.data));
        if (!asc.length) return { startWeight: null, currentWeight: null, deltaPeso: 0, lastDate: null, avgDelta: null, totalVisits: visite.length };
        const first = asc[0];
        const last = asc[asc.length - 1];
        const delta = (last.peso - first.peso).toFixed(1);
        const avgDelta = asc.length > 1 ? (delta / (asc.length - 1)).toFixed(1) : null;
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
        if (isIndependent(visit)) return null;
        const list = allVisits.filter((v) => !isIndependent(v));
        const index = list.findIndex((v) => v.id === visit.id);
        if (index === -1 || index === list.length - 1) return null;
        const prev = list[index + 1];
        return Number((visit.peso - prev.peso).toFixed(1));
    };

    // stessi stati di "Salva e Gestisci" (Dieta)
    // stato del piano detto per esteso, con colore e icona di "Salva e Gestisci" e a che punto del percorso è (0-3)
    const getDietBadge = (status) => {
        const st = statusById(status);
        const words = {
            todo: ['Non ancora iniziato', 0],
            draft: ['In bozza', 1],
            edit: ['Da correggere', 1],
            pending: ['Pronto, da inviare', 2],
            delivery: ['Consegnato', 3],
            active: ['In corso', 3],
        };
        const [label, step] = words[st.id] || words.todo;
        return { label, step, tone: st.color, bg: st.bg, icon: st.icon };
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
            <div className="max-w-md mx-auto text-center py-20 px-6">
                <p className="text-[17px] font-semibold text-[color:var(--ink)]">Ancora nessuna visita</p>
                <p className="text-[14px] text-[color:var(--muted)] mt-1">Le visite che registri compaiono qui, dalla più recente.</p>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="hs-root fade-enter max-w-5xl mx-auto pb-32 relative">
            {/* ── KPI CARDS ─────────────────────────────────────────────── */}
            <HistoryStatsCards stats={stats} visits={measured} />

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
            <div className="hs-scroll">
                <VisitList
                    patient={patient}
                    filteredVisits={filteredVisits}
                    getDietBadge={getDietBadge}
                    getWeightDelta={getWeightDelta}
                    handleDelete={handleDelete}
                    onOpenDiet={(v) => {
                    setSwap(null);
                    setDietFromDetail(false);
                    setDietVisit(v);
                }}
                    setSearchTerm={setSearchTerm}
                    setSelectedVisit={(v) => {
                        setSwap(null);
                        setSelectedVisit(v);
                    }}
                    sortedVisits={sortedVisits}
                />
            </div>

            {/* ── SEARCH CALENDAR MODAL ─────────────────────────────────── */}
            {
                <SearchCalendarModal
                    isSearchCalendarOpen={isSearchCalendarOpen}
                    setIsSearchCalendarOpen={setIsSearchCalendarOpen}
                    setSearchTerm={setSearchTerm}
                    searchTerm={searchTerm}
                    visitDates={visitDates}
                />
            }

            {/* ── VISIT DETAIL MODAL ────────────────────────────────────── */}
            {<VisitDetailModal
                swap={swap}
                selectedVisit={selectedVisit}
                setSelectedVisit={setSelectedVisit}
                previousVisit={selectedVisit ? sortedVisits.filter((v) => !isIndependent(v)).find((v) => new Date(v.data) < new Date(selectedVisit.data)) || null : null}
                sesso={patient.sesso}
                hasDiet={!!selectedVisit && Array.isArray(selectedVisit.dettagli?.diet_plan_data) && selectedVisit.dettagli.diet_plan_data.some((d) => (d.meals || []).some((m) => (m.items || []).length > 0))}
                onOpenDiet={(v) => {
                    setSwap('fwd');
                    setSelectedVisit(null);
                    setDietFromDetail(true);
                    setDietVisit(v);
                }}
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
                swap={swap}
                visit={dietVisit}
                onClose={() => setDietVisit(null)}
                onBack={() => {
                    const v = dietVisit;
                    setSwap(dietFromDetail ? 'back' : null);
                    setDietVisit(null);
                    if (dietFromDetail) setSelectedVisit(v);
                }}
                onPrint={
                    printCenter
                        ? (v) => {
                              setDietVisit(null);
                              printCenter.open([{ type: 'dieta', visitId: v.id }]);
                          }
                        : null
                }
                onEdit={(v) => {
                    setDietVisit(null);
                    onOpenDiet && onOpenDiet(v.id);
                }}
            />

            {toDelete && (
                <div className="sheet-back" onClick={() => setToDelete(null)}>
                    <div className="sheet" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-[19px] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">Eliminare la visita?</h3>
                        <p className="text-[14px] text-[color:var(--muted)] mt-2 leading-relaxed">
                            La visita del {new Date(toDelete.data).toLocaleDateString('it-IT', { dateStyle: 'long' })} ({toDelete.peso} kg) verrà eliminata definitivamente, con tutto ciò che contiene.
                        </p>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setToDelete(null)} className="vw-chip text-[14px] font-medium">
                                Annulla
                            </button>
                            <button onClick={confirmDelete} className="vw-chip text-[14px] font-semibold" style={{ background: 'var(--bad)', borderColor: 'var(--bad)', color: '#fff' }}>
                                Elimina visita
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
