import React, { useState } from 'react';
import { PrintCenter } from '../../components/reports/printCenter/PrintCenter';

const STUDIO = { id: '__lab', nome: '', cognome: '', visite: [] };

// Il quaderno unico, sempre a destra del modulo e fisso: è il Centro stampa incorporato (stesso motore di impaginazione) con tutto il laboratorio
// (esperimenti, protocolli, ricettario, magazzino, campioni, bibliografia). Si scrive direttamente sui fogli; in alto carattere, dimensione, Word e Stampa.
// «Tutto» o solo la pagina in compilazione; si aggiorna col salvataggio del modulo.
export const NotebookPreview = ({ db, activeId, kind = 'quaderno', vol = '' }) => {
    const [only, setOnly] = useState(false);
    const single = only && activeId;
    const initial = [{ type: 'lab', kind: single ? kind : 'quaderno', ...(single ? { ids: [activeId], volume: vol } : { completo: true }) }];
    const toggle = (
        <div className="seg" role="group" aria-label="Cosa mostrare">
            <button className={!only ? 'on' : ''} onClick={() => setOnly(false)}>Tutto il quaderno</button>
            <button className={only ? 'on' : ''} onClick={() => setOnly(true)} disabled={!activeId}>{kind === 'quaderno' ? 'Questa pagina' : 'Questa voce'}</button>
        </div>
    );
    return (
        <div className="lab-pagescol">
            <div className="lab-pagesbody">
                <PrintCenter bar={toggle} key={single ? `one-${kind}` : 'all'} embedded scope="lab" patient={STUDIO} db={db} initial={initial} onClose={() => {}} />
            </div>
        </div>
    );
};
