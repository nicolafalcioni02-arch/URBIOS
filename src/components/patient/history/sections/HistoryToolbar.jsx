import React from 'react';

export const HistoryToolbar = ({ filteredVisits, searchTerm, setIsSearchCalendarOpen, setSearchTerm, setShowSmartPlot }) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-[color:var(--ink)]">Visite</h3>
                {searchTerm ? (
                    <span className="inline-flex items-center gap-1.5 h-7 pl-3 pr-1 rounded-full bg-[color:var(--soft)] text-[13px] font-medium text-[color:var(--ink)]">
                        {new Date(searchTerm).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                        <button onClick={() => setSearchTerm('')} className="w-5 h-5 !min-h-0 rounded-full grid place-items-center text-[color:var(--muted)] hover:bg-white hover:text-[color:var(--ink)]" aria-label="Togli il filtro per data">
                            <i className="ph-bold ph-x text-[11px]"></i>
                        </button>
                    </span>
                ) : (
                    <span className="text-[13px] text-[color:var(--muted)] tabular-nums">{filteredVisits.length}</span>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                <button onClick={() => setIsSearchCalendarOpen(true)} className="vw-chip text-[13px] font-medium text-[color:var(--ink)]">
                    <i className="ph ph-calendar-blank"></i>
                    Filtra per data
                </button>
                <button onClick={() => setShowSmartPlot(true)} className="vw-chip text-[13px] font-medium" style={{ background: 'var(--ink)', borderColor: 'var(--ink)', color: '#fff' }}>
                    <i className="ph ph-chart-line-up"></i>
                    Smart Plot
                </button>
            </div>
        </div>
    );
};
