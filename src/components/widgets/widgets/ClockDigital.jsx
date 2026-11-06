import React, { useEffect, useState } from 'react';

// Orologio digitale: ore e minuti grandi, secondi piccoli, giorno e data sotto. Colori dal tono scelto.
export const ClockDigital = () => {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    const p = (n) => String(n).padStart(2, '0');
    return (
        <div className="wd-card wd-dclock">
            <p className="wd-dclock-time">
                {p(now.getHours())}:{p(now.getMinutes())}
                <small>{p(now.getSeconds())}</small>
            </p>
            <p className="wd-dclock-date">{now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
    );
};
