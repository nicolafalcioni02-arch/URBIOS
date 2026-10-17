import React, { useEffect, useMemo, useRef, useState } from 'react';
import { svgContent } from './assets/somatochartSvg';

const BASE_W = 680;
const BASE_H = 642;

// Stessa calibrazione del grafico a schermo (area 680×642), usata anche dalla versione per la stampa
const pointOf = (endo, meso, ecto) => {
    const sx = ecto - endo;
    const sy = 2 * meso - (endo + ecto);
    return { x: BASE_W / 2 - 20 + sx * 18.9 * 2, y: BASE_H / 2 - 2 - sy * 18.9 };
};

// Versione per la stampa: disegno e pallino nello stesso SVG, si adatta alla larghezza del riquadro senza tagli
// (l'SVG originale è 172,5×169,4 mm, cioè 652×640 px, appoggiato in alto a sinistra dell'area 680×642)
const printSvg = svgContent.replace(/width="172\.51172mm"/, 'width="652.01"').replace(/height="169\.39137mm"/, 'height="640.21"');
export const SomatocartaPrint = ({ endo = 0, meso = 0, ecto = 0 }) => {
    const p = pointOf(endo, meso, ecto);
    const x = Math.max(8, Math.min(BASE_W - 8, p.x));
    const y = Math.max(8, Math.min(BASE_H - 8, p.y));
    return (
        <svg viewBox={`0 0 ${BASE_W} ${BASE_H}`} width="100%" style={{ display: 'block' }} role="img" aria-label={`Somatotipo: endo ${endo.toFixed(1)}, meso ${meso.toFixed(1)}, ecto ${ecto.toFixed(1)}`}>
            <g opacity="0.8" dangerouslySetInnerHTML={{ __html: printSvg }} />
            <circle cx={x} cy={y} r="13" fill="#dc2626" stroke="#fff" strokeWidth="5" />
        </svg>
    );
};

export const Somatocarta = ({ endo = 0, meso = 0, ecto = 0 }) => {
    // Il grafico è disegnato a misura fissa (680×642): su schermi stretti lo si rimpicciolisce in proporzione
    // (il pallino è calcolato nelle stesse coordinate, quindi resta al suo posto).
    const wrapRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    useEffect(() => {
        const el = wrapRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return undefined;
        const update = () => setZoom(Math.min(1, el.clientWidth / BASE_W) || 1);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // --- LOGICA DI POSIZIONAMENTO (Calibrazione mantenuta) ---
    const position = useMemo(() => {
        // Formule Somatotipo X, Y
        const somatoX = ecto - endo;
        const somatoY = 2 * meso - (endo + ecto);

        // Calibrazione Specifica per questo SVG
        // Dimensioni fisse del container per rispettare la scala "18.9"
        const containerWidth = 680;
        const containerHeight = 642;

        const offX = -20;
        const offY = -2;
        const scale = 18.9;

        const centerX = containerWidth / 2 + offX;
        const centerY = containerHeight / 2 + offY;

        // Calcolo pixel finali (con correzione X * 2 come da tua formula)
        const pixelX = centerX + somatoX * scale * 2;
        const pixelY = centerY - somatoY * scale;

        return { x: pixelX, y: pixelY, sx: somatoX.toFixed(1), sy: somatoY.toFixed(1) };
    }, [endo, meso, ecto]);

    return (
        <div ref={wrapRef} className="flex flex-col items-center justify-center w-full h-full min-w-0">
            {/* Dati Testuali */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-4 text-xs font-bold text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                <span className="text-rose-500">Endo: {endo.toFixed(1)}</span>
                <span className="text-emerald-500">Meso: {meso.toFixed(1)}</span>
                <span className="text-blue-500">Ecto: {ecto.toFixed(1)}</span>
                <span className="text-gray-400 border-l border-gray-300 pl-4 ml-2">
                    X: {position.sx} | Y: {position.sy}
                </span>
            </div>

            {/* Container Grafico */}
            <div style={{ width: BASE_W * zoom, height: BASE_H * zoom }}>
            <div
                className="relative bg-white border border-gray-100 shadow-inner rounded-xl overflow-hidden"
                style={{ width: BASE_W, height: BASE_H, transform: `scale(${zoom})`, transformOrigin: 'top left' }}
            >
                {/* PALLINO ROSSO (Sopra l'SVG) */}
                <div
                    className="absolute w-4 h-4 bg-red-600 border-2 border-white rounded-full shadow-lg z-20 transition-all duration-500 ease-out"
                    style={{
                        left: position.x,
                        top: position.y,
                        transform: 'translate(-50%, -50%)',
                    }}
                ></div>

                {/* SVG SFONDO (Inserito come HTML puro per compatibilità) */}
                <div className="absolute inset-0 z-10 opacity-80 pointer-events-none" dangerouslySetInnerHTML={{ __html: svgContent }}></div>
            </div>
            </div>
        </div>
    );
};
