import React, { useMemo } from 'react';
import { svgContent } from './assets/somatochartSvg';

export const Somatocarta = ({ endo = 0, meso = 0, ecto = 0 }) => {
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
        <div className="flex flex-col items-center justify-center w-full h-full">
            {/* Dati Testuali */}
            <div className="flex gap-4 mb-4 text-xs font-bold uppercase tracking-widest text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                <span className="text-rose-500">Endo: {endo.toFixed(1)}</span>
                <span className="text-emerald-500">Meso: {meso.toFixed(1)}</span>
                <span className="text-blue-500">Ecto: {ecto.toFixed(1)}</span>
                <span className="text-gray-400 border-l border-gray-300 pl-4 ml-2">
                    X: {position.sx} | Y: {position.sy}
                </span>
            </div>

            {/* Container Grafico */}
            <div className="relative bg-white border border-gray-100 shadow-inner rounded-xl overflow-hidden" style={{ width: '680px', height: '642px' }}>
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
    );
};
