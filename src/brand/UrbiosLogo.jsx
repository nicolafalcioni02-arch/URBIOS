import React from 'react';

// Logo URBIOS definitivo (sorgente: urbios_logo_definitivo.svg). Colore = testo corrente, così segue tema e look.
export const UrbiosLogo = ({ size = 28, className = '', style }) => (
    <svg width={size} height={size} viewBox="304.2 290.6 647.1 647.1" fill="currentColor" className={className} style={style} role="img" aria-label="URBIOS">
        <path d="M945.28,614.13 A317.54,317.54 0 1,0 940.29,670.16 A92.62,92.62 0 1,0 757.31,641.74 A211.69,211.69 0 0,1 378.07,741.14 A145.54,145.54 0 0,1 403.97,539.87 L534.29,436.27 A277.85,277.85 0 0,1 783.13,386.57 A105.85,105.85 0 0,1 859.53,478.14 A52.92,52.92 0 0,0 887.94,520.05 A105.85,105.85 0 0,1 945.28,614.13 Z" />
    </svg>
);

// Versione orizzontale del lockup (scheda "Versioni del logo"): `size` = altezza del simbolo;
// scritta 0.31 × simbolo, peso 500, spaziatura 0.45em, distanza 0.26 × simbolo
export const UrbiosWordmark = ({ size = 32, text = 0.31, className = '', style }) => (
    <span className={`inline-flex items-center ${className}`} style={{ gap: size * 0.26, ...style }}>
        <UrbiosLogo size={size} />
        <span style={{ fontSize: size * text, fontWeight: 500, letterSpacing: '0.45em', marginRight: '-0.45em', lineHeight: 1 }}>URBIOS</span>
    </span>
);
