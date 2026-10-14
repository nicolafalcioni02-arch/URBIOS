import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { PrintCenter } from './PrintCenter';

const Ctx = createContext(null);

// Il Centro stampa è uno solo per la scheda paziente: chiunque al suo interno lo apre con usePrintCenter().open(...).
// open() senza argomenti = ultimo pacchetto usato; open(['dieta']) o open([{ type: 'grafici', visitId }]) = solo quei documenti.
export const usePrintCenter = () => useContext(Ctx);

// La Nuova visita registra qui i dati in corso (con i risultati calcolati), così si possono stampare prima di salvare
export const usePrintDraft = (getDraft) => {
    const api = useContext(Ctx);
    const ref = useRef(getDraft);
    ref.current = getDraft;
    useEffect(() => {
        if (!api) return undefined;
        api.draftRef.current = () => ref.current();
        return () => {
            api.draftRef.current = null;
        };
    }, [api]);
};

export const PrintCenterProvider = ({ patient, db, onUpdateDb, readOnly = false, children }) => {
    const [req, setReq] = useState(null);
    const draftRef = useRef(null);
    const api = useMemo(() => ({ open: (items = null) => setReq({ items, n: Date.now() }), draftRef }), []);
    let draft = null;
    if (req && draftRef.current) {
        try {
            draft = draftRef.current();
        } catch (e) {
            draft = null;
        }
    }
    return (
        <Ctx.Provider value={api}>
            {children}
            {req && <PrintCenterHost key={req.n} req={req} patient={patient} db={db} onUpdateDb={onUpdateDb} readOnly={readOnly} draft={draft} onClose={() => setReq(null)} />}
        </Ctx.Provider>
    );
};

// la visita in corso si fotografa all'apertura: mentre si compone il documento non cambia sotto le mani
const PrintCenterHost = ({ req, draft, ...rest }) => {
    const [snap] = useState(draft);
    return <PrintCenter {...rest} draft={snap} initial={req.items} />;
};
