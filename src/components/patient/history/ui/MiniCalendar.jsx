import React, { useState, useMemo } from 'react';

// ─── Mini Calendar Component ──────────────────────────────────────────────────
export const MiniCalendar = ({ visitDates, onSelectDate, onClose }) => {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const visitDateSet = useMemo(() => new Set(visitDates), [visitDates]);

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    // shift so Monday=0
    const startOffset = (firstDayOfWeek + 6) % 7;

    const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const dayLabels = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'];

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else setViewMonth((m) => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else setViewMonth((m) => m + 1);
    };

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div className="p-2">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
                <button onClick={prevMonth} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                    <i className="ph-bold ph-caret-left text-xs"></i>
                </button>
                <span className="text-xs font-semibold text-gray-800">
                    {monthNames[viewMonth]} {viewYear}
                </span>
                <button onClick={nextMonth} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                    <i className="ph-bold ph-caret-right text-xs"></i>
                </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 mb-1">
                {dayLabels.map((d) => (
                    <div key={d} className="text-center text-[11px] font-bold text-gray-400 py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((day, idx) => {
                    if (!day) return <div key={`e-${idx}`} />;
                    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const hasVisit = visitDateSet.has(iso);
                    const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                    return (
                        <button
                            key={iso}
                            onClick={() => hasVisit && onSelectDate(iso)}
                            className={`
                                relative mx-auto w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all
                                ${hasVisit ? 'bg-black text-white hover:bg-gray-800 cursor-pointer shadow-sm' : 'text-gray-400 cursor-default'}
                                ${isToday && !hasVisit ? 'ring-1 ring-gray-300' : ''}
                            `}
                        >
                            {day}
                            {hasVisit && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-400 rounded-full"></span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
