import React, { useRef, useState } from 'react';

// "Come citarci": URBIOS è gratuito; a chi lo usa per tesi e pubblicazioni chiediamo di citarlo (APA 7 e BibTeX)
const TITLE = "URBIOS: Software per la gestione clinico-nutrizionale e la prescrizione dell'esercizio fisico";
const APA = `Falcioni, N., Berardi, I., & Bellanova, N. (2026). ${TITLE} (Versione 1.0) [Computer software].`;
const BIB = `@software{urbios2026,
  author  = {Falcioni, Nicola and Berardi, Ilaria and Bellanova, Nicole},
  title   = {${TITLE}},
  year    = {2026},
  version = {1.0},
  note    = {Computer software}
}`;

const copyText = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return ok;
        } catch {
            return false;
        }
    }
};

// se il browser non lascia copiare, si seleziona il testo: basta premere ⌘C / Ctrl+C
const selectNode = (el) => {
    if (!el) return;
    const r = document.createRange();
    r.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(r);
};

const Card = ({ label, children, text, k, state, onCopy, mono }) => {
    const ref = useRef(null);
    const st = state[k];
    return (
        <div className="rounded-[18px] p-5 text-[14px] leading-relaxed" style={{ background: 'var(--surface)', boxShadow: 'inset 0 0 0 .5px var(--line)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)] mb-2">{label}</p>
            <div ref={ref} className={mono ? 'font-mono text-[12px] whitespace-pre-wrap text-[color:var(--ink)]' : 'text-[color:var(--ink)]'} style={mono ? undefined : { paddingLeft: '1.6em', textIndent: '-1.6em' }}>
                {children}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => onCopy(k, text, ref.current)} className="vw-chip !h-9 !px-4 text-[13px]">
                    <i className={`ph ${st === 'ok' ? 'ph-check' : 'ph-copy'}`}></i> {st === 'ok' ? 'Copiata' : 'Copia'}
                </button>
                {st === 'sel' && <span className="text-[12.5px] text-[color:var(--muted)]">Testo selezionato: premi ⌘C (o Ctrl+C) per copiarlo.</span>}
            </div>
        </div>
    );
};

export const CiteTab = ({ tab }) => {
    const [state, setState] = useState({});
    if (tab !== 'cita') return null;
    const onCopy = async (k, text, node) => {
        const ok = await copyText(text);
        if (!ok) selectNode(node);
        setState({ [k]: ok ? 'ok' : 'sel' });
        if (ok) setTimeout(() => setState({}), 2200);
    };
    return (
        <div className="fade-enter max-w-xl mx-auto py-6 md:py-10">
            <div className="w-14 h-14 rounded-[18px] grid place-items-center text-white text-[26px]" style={{ background: '#0C8F7E' }}>
                <i className="ph-fill ph-quotes"></i>
            </div>
            <h1 className="mt-5 text-[26px] font-semibold leading-tight text-[color:var(--ink)]">Come citare URBIOS</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[color:var(--ink)]">
                URBIOS è gratuito e lo resterà. Se lo usi per una <b>tesi</b>, una <b>pubblicazione</b>, un poster o un lavoro di ricerca, ti chiediamo per favore di citarlo.
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--muted)]">È il modo più semplice per sostenere il progetto, farlo conoscere e permetterci di continuare a migliorarlo per tutti.</p>

            <div className="mt-7 space-y-3">
                <Card label="Citazione · APA 7" k="apa" text={APA} state={state} onCopy={onCopy}>
                    Falcioni, N., Berardi, I., &amp; Bellanova, N. (2026). <i>{TITLE}</i> (Versione 1.0) [Computer software].
                </Card>
                <Card label="BibTeX · per LaTeX, Zotero, Mendeley" k="bib" text={BIB} state={state} onCopy={onCopy} mono>
                    {BIB}
                </Card>
            </div>

            <p className="mt-6 text-[13px] leading-relaxed text-[color:var(--muted)]">
                Nel testo puoi scrivere, per esempio: «I dati sono stati raccolti ed elaborati con URBIOS (Falcioni, Berardi &amp; Bellanova, 2026)». Grazie!
            </p>
        </div>
    );
};
