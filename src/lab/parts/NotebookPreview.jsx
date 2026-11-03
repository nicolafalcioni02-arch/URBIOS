import React, { useState } from 'react';
import { PrintCenter } from '../../components/reports/printCenter/PrintCenter';

const STUDIO = { id: '__lab', nome: '', cognome: '', visite: [] };

// Il quaderno a destra del modulo è il Centro stampa stesso (incorporato): stesso motore di impaginazione, stessi fogli A4,
// copertina, indici, reagentario e una pagina per esperimento. «Tutto» o solo la pagina in compilazione; si aggiorna col salvataggio.
export const NotebookPreview = ({ db, activeId }) => {
    const [only, setOnly] = useState(false);
    const single = only && activeId;
    const initial = [{ type: 'quaderno', ...(single ? { ids: [activeId] } : {}) }]; // stesse pagine a quadretti della stampa
    return (
        <div className="lab-pagescol">
            <div className="lab-pageshead">
                <div className="seg lab-seg" role="group" aria-label="Cosa mostrare">
                    <button className={!only ? 'on' : ''} onClick={() => setOnly(false)}>Tutto il quaderno</button>
                    <button className={only ? 'on' : ''} onClick={() => setOnly(true)} disabled={!activeId}>Solo questa pagina</button>
                </div>
            </div>
            <div className="lab-pagesbody">
                <PrintCenter key={single ? 'one' : 'all'} embedded scope="lab" patient={STUDIO} db={db} initial={initial} onClose={() => {}} />
            </div>
        </div>
    );
};
