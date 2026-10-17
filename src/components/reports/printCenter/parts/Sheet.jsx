import React, { useLayoutEffect, useRef, useState } from 'react';
import { DOC_TYPES } from '../catalog';
import { fmtDate } from '../logic/visits';

// Marchio URBIOS con copyright, in fondo a ogni foglio
const BrandMark = ({ style }) => (
    <span className="pc-bm" style={style}>
        <i className="pc-bm-orb" />
        <b>URBIOS</b>
        <span>© 2026</span>
    </span>
);

// Foglio A4 con intestazione e piè di pagina; il contenuto sta in .pc-body, nell'area utile calcolata dal tema
export const Sheet = ({ g, theme, layoutClass, accent, withHead, withFoot = true, page, total, patientName, prof, title, children, bare = false }) => {
    const m = g.m;
    const top = m.t + (withHead ? g.head : 0);
    const studio = [prof.nome, prof.cognome].filter(Boolean).join(' ');
    return (
        <div className={`pc-sheet pc-theme ${layoutClass}`} style={{ '--accent': accent, '--pc-scale': theme.scale, '--m-t': `${m.t}mm`, '--m-s': `${m.s}mm`, '--m-b': `${m.b}mm` }}>
            <div className="pc-deco">
                <i />
                <i />
            </div>
            {!bare && withHead && (
                <div className="pc-head" style={{ top: `${m.t}mm`, left: `${m.s}mm`, right: `${m.s}mm` }}>
                    <span>
                        <span className="acc">{studio || 'Studio'}</span>
                        {prof.titolo_professionale ? <span> · {prof.titolo_professionale}</span> : null}
                    </span>
                    <span>
                        {title} · <b>{patientName}</b>
                    </span>
                </div>
            )}
            {bare ? (
                children
            ) : (
                <div className="pc-body" style={{ top: `${top}mm`, left: `${m.s}mm`, width: `${g.contentW}mm`, height: `${g.heightMm(withHead)}mm` }}>
                    {children}
                </div>
            )}
            {!bare && withFoot && theme.footer && (
                <div className="pc-foot" style={{ bottom: `${m.b}mm`, left: `${m.s}mm`, right: `${m.s}mm` }}>
                    <span>Documento personale e riservato · {fmtDate(new Date())}</span>
                    <BrandMark />
                    {theme.numbers && (
                        <span className="num">
                            Pagina {page} di {total}
                        </span>
                    )}
                </div>
            )}
            {/* senza piè di pagina (copertina o piè disattivato) il marchio resta in fondo da solo */}
            {(bare || !withFoot || !theme.footer) && <BrandMark style={{ position: 'absolute', left: '50%', bottom: `${Math.max(4, m.b - 4)}mm`, transform: 'translateX(-50%)' }} />}
        </div>
    );
};

// riduce il contenuto (pagine grafiche) finché sta nell'area utile del foglio
export const FitBox = ({ children }) => {
    const ref = useRef(null);
    const [s, setS] = useState(1);
    const sRef = useRef(1);
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const fit = () => {
            const avail = el.parentElement.clientHeight;
            const h = el.offsetHeight;
            if (!avail || !h) return;
            const cur = sRef.current;
            const next = Math.max(0.45, Math.min(1, cur * (avail / (h * cur))));
            if (Math.abs(next - cur) > 0.004 && (next < cur || h * cur < avail * 0.96)) {
                sRef.current = next;
                setS(next);
            }
        };
        fit();
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
        if (ro) ro.observe(el);
        const t = setTimeout(fit, 400); // i grafici finiscono di disegnarsi dopo
        return () => {
            if (ro) ro.disconnect();
            clearTimeout(t);
        };
    }, []);
    return (
        <div ref={ref} className="pc-fit" style={{ width: `${100 / s}%`, transform: `scale(${s})` }}>
            {children}
        </div>
    );
};

// Copertina con sommario (i numeri di pagina arrivano dall'impaginazione)
export const CoverPage = ({ item, patient, prof, index }) => {
    const o = item.opts || {};
    const studio = [prof.nome, prof.cognome].filter(Boolean).join(' ');
    const contacts = [prof.indirizzo_studio, prof.citta_studio, prof.telefono, prof.email].filter(Boolean);
    return (
        <div className="pc-cover">
            <div className="pc-cover-top">
                <span>{studio}</span>
                {prof.logo_url ? <img src={prof.logo_url} alt="" /> : <span>{prof.titolo_professionale || ''}</span>}
            </div>
            <div className="pc-cover-mid">
                <div className="pc-cover-kicker">{o.subtitle || 'Report personale'}</div>
                <h1 className="pc-cover-title">{o.title || 'Il tuo percorso'}</h1>
                <div className="pc-cover-rule" />
                <div className="pc-cover-name">
                    {patient.nome} {patient.cognome}
                </div>
                <div className="pc-cover-date">{fmtDate(new Date())}</div>
            </div>
            {o.index !== false && index.length > 0 && (
                <div className="pc-cover-index">
                    <h4>In questo documento</h4>
                    {index.map((x) => (
                        <div key={x.id}>
                            <b>{x.label}</b>
                            <i />
                            <span>{x.page}</span>
                        </div>
                    ))}
                </div>
            )}
            {o.contacts !== false && (studio || contacts.length > 0) && (
                <div className="pc-cover-foot" style={o.index !== false && index.length ? undefined : { marginTop: 'auto' }}>
                    <div>
                        <strong>{studio}</strong>
                        {prof.titolo_professionale}
                        {prof.ordine_appartenenza ? ` · ${prof.ordine_appartenenza}${prof.numero_albo ? ` n. ${prof.numero_albo}` : ''}` : ''}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        {contacts.map((c) => (
                            <div key={c}>{c}</div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export const typeLabel = (t) => DOC_TYPES[t]?.label || t;
