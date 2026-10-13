import React from 'react';

// Carico settimanale (sRPE) con il rapporto acuto:cronico. Barre arancio = scarico.
export const WeekLoadChart = ({ weeks }) => {
    const max = Math.max(...weeks.map((w) => w.weekLoad), 1);
    const W = Math.max(360, weeks.length * 78),
        H = 170,
        pad = 28;
    const bw = Math.min(46, (W - pad) / weeks.length - 14);
    return (
        <svg viewBox={`0 0 ${W} ${H + 34}`} style={{ width: '100%', maxWidth: W, display: 'block' }}>
            {weeks.map((w, i) => {
                const x = pad + i * ((W - pad) / weeks.length) + 6;
                const h = (w.weekLoad / max) * (H - 30);
                const col =
                    w.kind === 'deload' ? '#FF9F0A' : w.acwr !== null && w.acwr > 1.5 ? '#FF3B30' : w.acwr !== null && w.acwr > 1.3 ? '#FFCC00' : '#007AFF';
                return (
                    <g key={w.id}>
                        <rect x={x} y={H - h} width={bw} height={Math.max(h, 1)} rx={5} fill={col} />
                        <text x={x + bw / 2} y={H - h - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#333">
                            {Math.round(w.weekLoad)}
                        </text>
                        <text x={x + bw / 2} y={H + 14} textAnchor="middle" fontSize="10" fill="#666">
                            S{i + 1}
                        </text>
                        <text x={x + bw / 2} y={H + 28} textAnchor="middle" fontSize="9" fill="#999">
                            {w.acwr !== null ? `ACWR ${String(Math.round(w.acwr * 100) / 100).replace('.', ',')}` : ''}
                        </text>
                    </g>
                );
            })}
            <line x1={pad - 4} y1={H} x2={W} y2={H} stroke="#DDD" />
        </svg>
    );
};
