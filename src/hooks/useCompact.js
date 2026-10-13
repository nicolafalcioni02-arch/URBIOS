import { useEffect, useState } from 'react';

// Vero quando lo schermo e' stretto (telefono, tablet in verticale): li' si usano le viste pensate per il pollice.
export const useCompact = (maxWidth = 900) => {
    const query = `(max-width: ${maxWidth}px)`;
    const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
    useEffect(() => {
        const mq = window.matchMedia(query);
        const on = (e) => setCompact(e.matches);
        mq.addEventListener('change', on);
        setCompact(mq.matches);
        return () => mq.removeEventListener('change', on);
    }, [query]);
    return compact;
};
