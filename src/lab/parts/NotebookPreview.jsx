import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { printCenterCss } from '../../components/reports/printCenter/printCenterStyles';
import { buildLabHtml } from '../../components/reports/printCenter/docs/lab';

const MM = 96 / 25.4; // px per mm
const PAGE_W = 210 * MM;

// Il quaderno già impaginato (una pagina A4 per esperimento, come in stampa), accanto al modulo.
// Si aggiorna da solo: il modulo salva da solo e `lab` cambia.
export const NotebookPreview = ({ lab, activeId }) => {
    const box = useRef(null);
    const [scale, setScale] = useState(0.6);
    const pages = useMemo(
        () => [...lab.quaderno].sort((a, b) => String(a.data).localeCompare(String(b.data))).map((r) => ({
            id: r.id,
            html: buildLabHtml({ db: { lab: { ...lab, quaderno: [r] } }, opts: { kind: 'quaderno' } }),
        })),
        [lab],
    );

    useLayoutEffect(() => {
        const fit = () => box.current && setScale(Math.min(1, Math.max(0.3, (box.current.clientWidth - 40) / PAGE_W)));
        fit();
        const ro = new ResizeObserver(fit);
        ro.observe(box.current);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (!activeId || !box.current) return;
        const el = box.current.querySelector(`[data-page="${activeId}"]`);
        if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [activeId, pages.length]);

    return (
        <div className="lab-pages" ref={box}>
            <style>{printCenterCss}</style>
            {pages.length === 0 && <p className="lab-pages-empty">Qui comparirà il quaderno impaginato.</p>}
            {pages.map((p, i) => (
                <div key={p.id} className="lab-pagewrap" style={{ width: PAGE_W * scale, minHeight: 297 * MM * scale }}>
                    <div
                        data-page={p.id}
                        className={`pc-sheet pc-theme lab-sheet${p.id === activeId ? ' on' : ''}`}
                        style={{ '--accent': '#2f54eb', '--pc-scale': 1, height: 'auto', minHeight: '297mm', padding: '15mm', transform: `scale(${scale})`, transformOrigin: 'top left' }}
                    >
                        <div className="pc-flow" dangerouslySetInnerHTML={{ __html: p.html }} />
                        <span className="lab-pagenum">{i + 1} / {pages.length}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
