import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { printCenterCss } from '../../components/reports/printCenter/printCenterStyles';
import { notebookParts } from '../../components/reports/printCenter/docs/lab';
import { Icon } from '../ui/icons';

const PAGE_W = (210 * 96) / 25.4; // A4 in px

// Il quaderno già impaginato accanto al modulo: copertina, indici, reagentario e una pagina per esperimento (come in stampa).
// «Tutto» o solo la pagina in compilazione. Si aggiorna col salvataggio automatico del modulo.
export const NotebookPreview = ({ lab, activeId, onPrintAll }) => {
    const box = useRef(null);
    const [only, setOnly] = useState(false);
    const [scale, setScale] = useState(0.6);
    const parts = useMemo(() => notebookParts(lab), [lab]);
    const shown = only && activeId ? parts.filter((p) => p.key === activeId) : parts;

    useLayoutEffect(() => {
        const fit = () => box.current && setScale(Math.min(1, Math.max(0.3, (box.current.clientWidth - 40) / PAGE_W)));
        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(box.current);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (!activeId || only || !box.current) return;
        const el = box.current.querySelector(`[data-page="${activeId}"]`);
        if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [activeId, only, parts.length]);

    return (
        <div className="lab-pagescol">
            <div className="lab-pageshead">
                <div className="seg lab-seg" role="group" aria-label="Cosa mostrare">
                    <button className={!only ? 'on' : ''} onClick={() => setOnly(false)}>Tutto il quaderno</button>
                    <button className={only ? 'on' : ''} onClick={() => setOnly(true)} disabled={!activeId}>Solo questa pagina</button>
                </div>
                <button className="lab-btn is-secondary is-sm" onClick={onPrintAll}><Icon name="printer" size={16} />Stampa tutto</button>
            </div>
            <div className="lab-pages" ref={box}>
                <style>{printCenterCss}</style>
                {shown.map((p) => (
                    <div
                        key={p.key}
                        data-page={p.key}
                        className={`pc-sheet pc-theme lab-sheet${p.key === activeId ? ' on' : ''}`}
                        style={{ '--pc-scale': 1, height: 'auto', minHeight: '297mm', padding: '15mm', zoom: scale }}
                    >
                        <div className="pc-flow" dangerouslySetInnerHTML={{ __html: p.html }} />
                    </div>
                ))}
                {only && !activeId && <p className="lab-pages-empty">Apri o crea un esperimento.</p>}
            </div>
        </div>
    );
};
