import React from 'react';

export const ConfirmSaveModal = ({ executeSave, setShowConfirmModal, showConfirmModal }) => {
    return (
        showConfirmModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 fade-enter">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 transform scale-100 transition-all">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <i className="ph-fill ph-floppy-disk text-2xl"></i>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Confermi il Salvataggio?</h3>

                    <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
                        Queste informazioni verranno inserite nel <strong>Report PDF</strong> e salvate nello <strong>storico del paziente</strong>.
                    </p>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-6 flex gap-3 items-start">
                        <i className="ph-fill ph-warning text-amber-500 text-xl flex-shrink-0 mt-0.5"></i>
                        <div className="text-xs text-amber-800">
                            <strong>Nota Bene:</strong> Se salvi nuovamente, il testo precedente verrà sovrascritto. In caso di errore, puoi correggere i dati e
                            premere "Salva" di nuovo tranquillamente.
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
                        >
                            Annulla
                        </button>
                        <button
                            onClick={executeSave}
                            className="flex-1 py-3 px-4 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-gray-300/50"
                        >
                            Conferma e Salva
                        </button>
                    </div>
                </div>
            </div>
        )
    );
};
