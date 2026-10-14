import React, { useEffect, useState } from 'react';

const ROMAN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
const MONTHS = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];
const DAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];

const polar = (deg, r) => [100 + r * Math.sin((deg * Math.PI) / 180), 100 - r * Math.cos((deg * Math.PI) / 180)];
const fg = { stroke: 'var(--wd-fg)' };

// Orologio con numeri romani: colori dal tono scelto, lancetta dei secondi continua, finestrella della data.
export const ClockRoman = () => {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 100);
        return () => clearInterval(t);
    }, []);
    const s = now.getSeconds() + now.getMilliseconds() / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;
    const hand = (deg, back, len, w) => <line x1={polar(deg + 180, back)[0]} y1={polar(deg + 180, back)[1]} x2={polar(deg, len)[0]} y2={polar(deg, len)[1]} style={fg} strokeWidth={w} strokeLinecap="round" />;
    return (
        <div className="wd-card wd-clock">
            <svg viewBox="0 0 200 200" role="img" aria-label={now.toLocaleTimeString('it-IT')}>
                <circle cx="100" cy="100" r="96" fill="none" style={fg} strokeWidth="2.5" />
                <circle cx="100" cy="100" r="90" fill="none" style={{ stroke: 'var(--wd-line)' }} strokeWidth="1" />
                {Array.from({ length: 60 }, (_, i) => {
                    const big = i % 5 === 0;
                    const [x1, y1] = polar(i * 6, big ? 80 : 84);
                    const [x2, y2] = polar(i * 6, 87);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} style={fg} strokeWidth={big ? 1.6 : 0.6} opacity={big ? 1 : 0.55} />;
                })}
                {ROMAN.map((r, i) => {
                    const [x, y] = polar(i * 30, 65);
                    return (
                        <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontFamily="'Playfair Display', serif" fontWeight="600" fontSize={r.length > 2 ? 11 : 13.5} style={{ fill: 'var(--wd-fg)' }}>
                            {r}
                        </text>
                    );
                })}
                <text x="100" y="50" textAnchor="middle" fontSize="6.5" letterSpacing="3" fontFamily="Inter, sans-serif" fontWeight="600" style={{ fill: 'var(--wd-mut)' }}>
                    URBIOS
                </text>
                <g transform="translate(100 136)">
                    <rect x="-19" y="-8" width="38" height="16" rx="5" style={{ fill: 'var(--wd-soft)' }} />
                    <text textAnchor="middle" dominantBaseline="central" fontSize="8.5" fontWeight="600" fontFamily="Inter, sans-serif" style={{ fill: 'var(--wd-fg)' }}>
                        {now.getDate()} {MONTHS[now.getMonth()]}
                    </text>
                </g>
                {hand(h * 30, 9, 42, 4.6)}
                {hand(m * 6, 11, 64, 3)}
                {hand(s * 6, 16, 74, 1.2)}
                <circle cx="100" cy="100" r="4.2" style={{ fill: 'var(--wd-bg)', stroke: 'var(--wd-acc)' }} strokeWidth="2" />
            </svg>
            <p className="wd-clock-date">
                {DAYS[now.getDay()]} · {now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
    );
};
