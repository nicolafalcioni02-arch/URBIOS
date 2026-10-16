import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MiniCalendar } from '../ui/MiniCalendar';

export const SearchCalendarModal = ({ isSearchCalendarOpen, setIsSearchCalendarOpen, setSearchTerm, visitDates, searchTerm }) => {
    const close = () => setIsSearchCalendarOpen(false);
    useEffect(() => {
        if (!isSearchCalendarOpen) return undefined;
        const onKey = (e) => e.key === 'Escape' && setIsSearchCalendarOpen(false);
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isSearchCalendarOpen, setIsSearchCalendarOpen]);

    if (!isSearchCalendarOpen) return null;
    const n = new Set(visitDates).size;
    // il filtro attivo è una data (YYYY-MM-DD); un testo libero non evidenzia nessun giorno
    const selected = /^\d{4}-\d{2}-\d{2}$/.test(searchTerm || '') ? searchTerm : null;

    return ReactDOM.createPortal(
        <div className="vd-back" style={{ zIndex: 10000 }} onClick={close}>
            <div className="vd-sheet fc-sheet" role="dialog" aria-modal="true" aria-label="Filtra per data" onClick={(e) => e.stopPropagation()}>
                <header className="vd-head">
                    <div className="min-w-0 flex-1">
                        <h3 className="vd-title">Filtra per data</h3>
                        <p className="vd-sub">
                            {n} {n === 1 ? 'visita' : 'visite'} in archivio · tocca un giorno evidenziato
                        </p>
                    </div>
                    <button onClick={close} className="hs-icon" aria-label="Chiudi">
                        <i className="ph ph-x"></i>
                    </button>
                </header>

                <div className="fc-body">
                    <MiniCalendar
                        visitDates={visitDates}
                        selected={selected}
                        onSelectDate={(iso) => {
                            setSearchTerm(iso);
                            close();
                        }}
                    />
                </div>

                <footer className="fc-foot">
                    <span className="fc-legend">
                        <i></i> Giorno con visita
                    </span>
                    {selected && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                close();
                            }}
                            className="vd-btn"
                        >
                            Mostra tutte le visite
                        </button>
                    )}
                </footer>
            </div>
        </div>,
        document.body
    );
};
