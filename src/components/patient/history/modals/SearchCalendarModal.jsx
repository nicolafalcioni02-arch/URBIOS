import React from 'react';
import ReactDOM from 'react-dom';
import { MiniCalendar } from '../ui/MiniCalendar';

export const SearchCalendarModal = ({ isSearchCalendarOpen, setIsSearchCalendarOpen, setSearchTerm, visitDates }) => {
    return (
        isSearchCalendarOpen &&
        ReactDOM.createPortal(
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-3xl w-full max-w-xs shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
                        <div>
                            <h3 className="font-black text-base text-gray-900">Filtra per data</h3>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                                {visitDates.length} visit{visitDates.length !== 1 ? 'e' : 'a'} in archivio · seleziona una data evidenziata
                            </p>
                        </div>
                        <button
                            onClick={() => setIsSearchCalendarOpen(false)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                            <i className="ph ph-x text-sm text-gray-600"></i>
                        </button>
                    </div>

                    {/* Calendar */}
                    <div className="px-3 py-4">
                        <MiniCalendar
                            visitDates={visitDates}
                            onSelectDate={(iso) => {
                                setSearchTerm(iso);
                                setIsSearchCalendarOpen(false);
                            }}
                            onClose={() => setIsSearchCalendarOpen(false)}
                        />
                    </div>

                    {/* Legend + close */}
                    <div className="px-5 pb-5 pt-2 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <span className="w-3 h-3 rounded-full bg-black inline-block"></span> Data visita
                        </div>
                        <button
                            onClick={() => setIsSearchCalendarOpen(false)}
                            className="px-4 py-1.5 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-colors"
                        >
                            Chiudi
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        )
    );
};
