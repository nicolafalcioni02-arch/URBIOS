import React, { useState } from 'react';

// Barra sopra i campi di testo dell'AI: seleziona tutto, copia tutto, incolla, cancella tutto.
// getEl() restituisce il <textarea> (o l'elemento di testo, se sola lettura); onChange è omesso nei campi di sola lettura.
export const AiTextTools = ({ value, onChange, getEl }) => {
    const [done, setDone] = useState('');
    const flash = (k) => { setDone(k); setTimeout(() => setDone(''), 1400); };
    const select = () => {
        const el = getEl?.();
        if (!el) return;
        if (el.select) { el.focus(); el.select(); return; }
        const r = document.createRange();
        r.selectNodeContents(el);
        const s = window.getSelection();
        s.removeAllRanges();
        s.addRange(r);
    };
    const copy = async () => {
        try { await navigator.clipboard.writeText(value || ''); flash('copy'); } catch { select(); document.execCommand?.('copy'); flash('copy'); }
    };
    const paste = async () => {
        try { onChange(await navigator.clipboard.readText()); flash('paste'); } catch { getEl?.()?.focus(); }
    };
    const clear = () => { onChange(''); getEl?.()?.focus?.(); };
    const btn = (k, icon, label, title, fn, off) => (
        <button type="button" className="vw-chip ai-tt" onClick={fn} disabled={off} title={title} aria-label={title}>
            <i className={`ph ph-${done === k ? 'check' : icon}`}></i><span>{label}</span>
        </button>
    );
    const empty = !value;
    return (
        <div className="ai-tools" role="toolbar" aria-label="Strumenti del testo">
            {btn('sel', 'selection-all', 'Seleziona', 'Seleziona tutto', select, empty)}
            {btn('copy', 'copy', 'Copia', 'Copia tutto', copy, empty)}
            {onChange && btn('paste', 'clipboard-text', 'Incolla', 'Incolla dagli appunti', paste)}
            {onChange && btn('clear', 'trash', 'Svuota', 'Cancella tutto', clear, empty)}
        </div>
    );
};
