import React from 'react';

export const HistoryToolbar = ({ filteredVisits, searchTerm, setIsSearchCalendarOpen, setSearchTerm, setShowSmartPlot }) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            {/* Search pill — shows active filter */}
            <div className="flex items-center gap-2">
                {searchTerm && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-xs font-bold">
                        <i className="ph-bold ph-funnel text-sm"></i>
                        <span>{new Date(searchTerm).toLocaleDateString('it-IT')}</span>
                        <button onClick={() => setSearchTerm('')} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
                            <i className="ph-bold ph-x text-xs"></i>
                        </button>
                    </div>
                )}
                {!searchTerm && (
                    <span className="text-xs text-gray-400 font-medium">
                        {filteredVisits.length} visit{filteredVisits.length !== 1 ? 'e' : 'a'}
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setIsSearchCalendarOpen(true)}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:border-gray-400 hover:shadow-md transition-all text-gray-700"
                >
                    <i className="ph-bold ph-calendar-blank text-base"></i>
                    <span className="text-[11px] font-bold ">Filtra per data</span>
                </button>
                <button
                    onClick={() => setShowSmartPlot(true)}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[color:var(--ink)] text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                    <i className="ph-fill ph-chart-line-up text-base"></i>
                    <span className="text-[11px] font-bold ">Smart Plot</span>
                </button>
            </div>
        </div>
    );
};
