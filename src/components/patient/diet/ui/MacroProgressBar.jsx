import React from 'react';

// --- COMPONENTE BARRA MACRO DINAMICA ---
export const MacroProgressBar = ({ label, current, target, hexColor }) => {
    const safeTarget = target > 0 ? target : 1;
    const rawPct = (current / safeTarget) * 100;
    const pct = Math.min(rawPct, 100);
    const isOver = current > target && target > 0;

    const activeColor = isOver ? '#FF3B30' : hexColor;

    // Calcolo opacità dinamica per lo sfondo (esattamente come hai chiesto:
    // parte chiara e arriva a circa il 70% quando la barra è al 90%)
    const trackOpacity = isOver ? 0.2 : 0.15 + (pct / 100) * 0.6;

    // Convertitore HEX to RGBA per iniettare l'opacità nello sfondo
    const hexToRgb = (hex) => {
        let r = 0,
            g = 0,
            b = 0;
        if (hex.length === 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        return `${r}, ${g}, ${b}`;
    };

    const trackBg = `rgba(${hexToRgb(activeColor)}, ${trackOpacity})`;

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 800, color: '#86868B', textTransform: 'uppercase' }}>
                <span>{label}</span>
                <span style={{ color: isOver ? '#FF3B30' : '#1D1D1F' }}>
                    {current.toFixed(0)} / {target.toFixed(0)} {label === 'Kcal' ? '' : 'g'}
                </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: trackBg, borderRadius: '4px', overflow: 'hidden', transition: 'background 0.3s ease' }}>
                <div
                    style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: activeColor,
                        borderRadius: '4px',
                        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease',
                    }}
                />
            </div>
        </div>
    );
};
