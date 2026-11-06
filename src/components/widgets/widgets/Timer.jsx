import React, { useEffect, useState } from 'react';

const PRESETS = [5, 10, 25, 45];
const fmt = (ms) => {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

const beep = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [0, 0.28, 0.56].forEach((t) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.frequency.value = 880;
            g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
            g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.22);
            o.connect(g).connect(ctx.destination);
            o.start(ctx.currentTime + t);
            o.stop(ctx.currentTime + t + 0.25);
        });
    } catch {
        /* audio non disponibile: pazienza */
    }
};

// Timer da cucina: il traguardo è salvato (endAt), quindi continua a correre anche se cambi schermata.
export const Timer = ({ data, setData, db }) => {
    const lab = !!(db && db.labOv);
    const total = data.total || 10 * 60000;
    const [, tick] = useState(0);
    const running = !!data.endAt;
    const left = running ? data.endAt - Date.now() : data.left ?? total;

    useEffect(() => {
        if (!running) return undefined;
        const t = setInterval(() => tick((n) => n + 1), 250);
        return () => clearInterval(t);
    }, [running]);

    useEffect(() => {
        if (running && left <= 0) {
            beep();
            setData({ endAt: null, left: 0 });
        }
    }, [running, left]); // eslint-disable-line react-hooks/exhaustive-deps

    const frac = Math.min(1, Math.max(0, left / total));
    const R = 42;
    const finished = !running && data.left === 0;
    return (
        <div className={`wd-card wd-timer${lab ? ' lab' : ''}`}>
            <div className="wd-timer-ring">
                <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={R} fill="none" style={{ stroke: 'var(--wd-soft)' }} strokeWidth="7" />
                    <circle cx="50" cy="50" r={R} fill="none" style={{ stroke: finished ? '#E5675F' : 'var(--wd-acc)', transition: 'stroke-dashoffset .3s linear' }} strokeWidth="7" strokeLinecap="round" strokeDasharray={2 * Math.PI * R} strokeDashoffset={2 * Math.PI * R * (1 - frac)} transform="rotate(-90 50 50)" />
                </svg>
                <strong className={finished ? 'end' : ''}>{finished ? 'Tempo!' : fmt(left)}</strong>
            </div>
            <div className="wd-timer-ctl">
            <div className="wd-timer-presets">
                {PRESETS.map((m) => (
                    <button key={m} className={!running && total === m * 60000 ? 'on' : ''} disabled={running} onClick={() => setData({ total: m * 60000, left: m * 60000, endAt: null })}>
                        {m}'
                    </button>
                ))}
            </div>
            <div className="wd-timer-actions">
                {running ? (
                    <button onClick={() => setData({ endAt: null, left: Math.max(0, data.endAt - Date.now()) })}>
                        <i className="ph-fill ph-pause" /> Pausa
                    </button>
                ) : (
                    <button onClick={() => setData({ total, endAt: Date.now() + (left > 0 ? left : total) })}>
                        <i className="ph-fill ph-play" /> {left > 0 && left < total ? 'Riprendi' : 'Avvia'}
                    </button>
                )}
                <button onClick={() => setData({ endAt: null, left: total })} aria-label="Azzera">
                    <i className="ph ph-arrow-counter-clockwise" />
                </button>
            </div>
            </div>
        </div>
    );
};
