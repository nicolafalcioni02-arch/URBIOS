import { useEffect } from 'react';

// Su iPhone la tastiera si apre sopra la pagina senza ridimensionarla: i fogli in basso restano nascosti.
// Misuriamo quanto spazio copre la tastiera e lo mettiamo in --kb: i fogli si alzano di quel tanto.
export const useKeyboardInset = () => {
    useEffect(() => {
        const vv = window.visualViewport;
        if (!vv) return undefined;
        const root = document.documentElement;
        const update = () => {
            const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
            root.style.setProperty('--kb', (kb > 80 ? Math.round(kb) : 0) + 'px'); // sotto 80px non e' una tastiera (barra del browser)
        };
        // il campo che si sta compilando resta in vista
        const onFocus = (e) => {
            const t = e.target;
            if (!t || !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
            setTimeout(() => t.scrollIntoView({ block: 'center', behavior: 'smooth' }), 320);
        };
        vv.addEventListener('resize', update);
        vv.addEventListener('scroll', update);
        document.addEventListener('focusin', onFocus);
        update();
        return () => {
            vv.removeEventListener('resize', update);
            vv.removeEventListener('scroll', update);
            document.removeEventListener('focusin', onFocus);
        };
    }, []);
};
