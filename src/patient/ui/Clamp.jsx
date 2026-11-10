import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './bits.jsx';

// Testo su poche righe: se è troppo lungo compare «Leggi tutto» e si apre un box con la scritta completa.
export const Clamp = ({ text, lines = 3, title = 'Testo completo', className = '', as: Tag = 'span' }) => {
    const ref = useRef(null), [cut, setCut] = useState(false), [open, setOpen] = useState(false);
    useLayoutEffect(() => {
        const el = ref.current; if (!el) return undefined;
        const check = () => { const lh = parseFloat(getComputedStyle(el).lineHeight) || el.clientHeight; setCut(el.scrollHeight - el.clientHeight > lh * 0.5); };
        check();
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null;
        if (ro) ro.observe(el);
        window.addEventListener('resize', check);
        return () => { if (ro) ro.disconnect(); window.removeEventListener('resize', check); };
    }, [text, lines]);
    const close = (e) => { if (e) e.stopPropagation(); setOpen(false); };
    return (
        <>
            <Tag ref={ref} className={'pt-clamp ' + className} style={{ WebkitLineClamp: lines }}>{text}</Tag>
            {cut && <button type="button" className="pt-more" onClick={(e) => { e.stopPropagation(); setOpen(true); }}>Leggi tutto <Icon name="back" size={12} /></button>}
            {open && createPortal(
                <div className="pt-ov" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
                    <div className="pt-ov-back" onClick={close} />
                    <section className="pt-dsheet">
                        <header><b>{title}</b><button type="button" className="pt-round" aria-label="Chiudi" onClick={close}><Icon name="close" /></button></header>
                        <p className="pt-clamp-full">{text}</p>
                    </section>
                </div>,
                document.body
            )}
        </>
    );
};
