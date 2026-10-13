import React from 'react';
import ReactDOM from 'react-dom';
import { DEFAULT_RANGE_EMATO } from '../../../../logic/db_defaults';
import { VisitDetailContent } from './VisitDetailContent';

export const VisitDetailModal = ({ selectedVisit, setSelectedVisit }) => {
    return (
        selectedVisit &&
        ReactDOM.createPortal(
            <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4">
                <div className="absolute top-0 left-0 w-full h-full bg-black/60 backdrop-blur-sm" onClick={() => setSelectedVisit(null)}></div>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden relative z-10 fade-enter flex flex-col">
                    <div className="bg-white border-b border-gray-100 p-4 flex justify-between items-center z-20 sticky top-0">
                        <div>
                            <h3 className="font-bold text-lg">Dettaglio Visita</h3>
                            <p className="text-xs text-gray-500">{new Date(selectedVisit.data).toLocaleDateString('it-IT', { dateStyle: 'full' })}</p>
                        </div>
                        <button
                            onClick={() => setSelectedVisit(null)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                            <i className="ph ph-x text-lg"></i>
                        </button>
                    </div>
                    {<VisitDetailContent selectedVisit={selectedVisit} />}
                </div>
            </div>,
            document.body
        )
    );
};
