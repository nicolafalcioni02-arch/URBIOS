import React, { useEffect, useState } from 'react';
import { fmtKg, fmtDelta } from './historyFormat';

// numero che sale fino al valore (salta l'animazione se il sistema chiede meno movimento)
const useCountUp = (target, ms = 900) => {
    const [v, setV] = useState(target);
    useEffect(() => {
        const to = Number(target);
        if (!isFinite(to) || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return setV(to);
        let raf;
        const t0 = performance.now();
        const tick = (now) => {
            const p = Math.min(1, (now - t0) / ms);
            setV(to * (1 - Math.pow(1 - p, 4)));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, ms]);
    return v;
};

// curva del peso visita per visita, nello stesso riquadro del peso attuale
const WeightCurve = ({ visits }) => {
    const pts = visits.filter((v) => isFinite(Number(v.peso)) && v.peso !== '' && v.peso !== null);
    if (pts.length < 2) return null;
    const ws = pts.map((v) => Number(v.peso));
    const min = Math.min(...ws);
    const max = Math.max(...ws);
    const pad = (max - min || 1) * 0.25;
    const lo = min - pad;
    const hi = max + pad;
    const xy = pts.map((v, i) => ({ x: (i / (pts.length - 1)) * 100, y: 100 - ((Number(v.peso) - lo) / (hi - lo)) * 100, v }));
    const line = xy.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
    const fmtD = (d) => new Date(d).toLocaleDateString('it-IT', { month: 'short', year: '2-digit' });
    return (
        <div className="hs-curve">
            <div className="hs-curve-plot">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                        <linearGradient id="hs-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#fff" stopOpacity=".16" />
                            <stop offset="1" stopColor="#fff" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path className="hs-curve-area" d={`${line} L100,100 L0,100 Z`} fill="url(#hs-fill)" />
                    <path className="hs-curve-line" d={line} fill="none" stroke="#fff" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
                {xy.map((p, i) => (
                    <span
                        key={p.v.id || i}
                        className={`hs-dot ${i === xy.length - 1 ? 'is-last' : ''}`}
                        style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${0.35 + (i / xy.length) * 0.7}s` }}
                        title={`${new Date(p.v.data).toLocaleDateString('it-IT', { dateStyle: 'medium' })} · ${fmtKg(p.v.peso)} kg`}
                    />
                ))}
            </div>
            <div className="hs-curve-axis">
                <span>{fmtD(pts[0].data)}</span>
                <span>{fmtD(pts[pts.length - 1].data)}</span>
            </div>
        </div>
    );
};

// la luce sul vetro segue il puntatore (sul touch resta ferma)
const followLight = (e) => {
    if (e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
};

export const HistoryStatsCards = ({ stats, visits = [] }) => {
    const delta = Number(stats.deltaPeso);
    const weight = useCountUp(stats.currentWeight);
    const deltaAnim = useCountUp(delta);
    const count = useCountUp(stats.totalVisits, 600);
    const down = delta < 0;
    const asc = [...visits].sort((a, b) => new Date(a.data) - new Date(b.data));
    return (
        <section className="hs-hero">
            <div className="hs-main rise" onPointerMove={followLight}>
              <div className="hs-glass">
                <div className="hs-main-head">
                    <div>
                        <p className="hs-main-label">
                            <i className="ph ph-scales"></i> Peso attuale
                        </p>
                        <p className="hs-main-figure">
                            {stats.currentWeight == null ? '–' : fmtKg(Math.round(weight * 10) / 10)}
                            <span>kg</span>
                        </p>
                    </div>
                    <p className="hs-main-date">
                        ultima misura
                        <b>{stats.lastDate ? new Date(stats.lastDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : 'nessuna misura'}</b>
                    </p>
                </div>
                <WeightCurve visits={asc} />
              </div>
            </div>

            <div className="hs-side">
                <div className="hs-tile rise" style={{ animationDelay: '.08s' }}>
                    <p className="hs-tile-label">Dalla prima visita</p>
                    <p className="hs-tile-figure" style={{ color: down ? 'var(--ok)' : delta > 0 ? 'var(--bad)' : 'var(--ink)' }}>
                        <i className={`ph-bold ${down ? 'ph-arrow-down-right' : delta > 0 ? 'ph-arrow-up-right' : 'ph-minus'}`}></i>
                        {fmtDelta(Math.round(deltaAnim * 10) / 10)}
                        <span>kg</span>
                    </p>
                    <p className="hs-tile-note">{stats.startWeight == null ? 'nessun peso misurato' : `partendo da ${fmtKg(stats.startWeight)} kg`}</p>
                </div>
                <div className="hs-tile rise" style={{ animationDelay: '.16s' }}>
                    <p className="hs-tile-label">Visite</p>
                    <p className="hs-tile-figure">{Math.round(count)}</p>
                    {stats.avgDelta && <p className="hs-tile-note">in media {fmtDelta(Number(stats.avgDelta))} kg a visita</p>}
                </div>
            </div>
        </section>
    );
};
