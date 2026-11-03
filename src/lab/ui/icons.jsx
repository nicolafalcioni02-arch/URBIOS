import React from 'react';

// Icone del Laboratorio: SVG a tratto unico, 24x24, colore = currentColor (stesso linguaggio delle Impostazioni).
// Per aggiungerne una: una voce in PATHS (solo il contenuto dell'<svg>), poi <Icon name="..." />.
const PATHS = {
    home: <path d="M4 11l8-6.5 8 6.5M6 9.8V19a1 1 0 0 0 1 1h3.5v-5h3v5H17a1 1 0 0 0 1-1V9.8" />,
    notebook: (<><rect x="5" y="3.5" width="14" height="17" rx="2" /><path d="M9 3.5v17M12.5 8h3.5M12.5 11.5h3.5" /></>),
    protocol: (<><path d="M5 6.2l1.4 1.4L9 5M5 12.2l1.4 1.4L9 11M5 18.2l1.4 1.4L9 17" /><path d="M13 7h6M13 13h6M13 19h6" /></>),
    flask: (<><path d="M9.5 3.5h5" /><path d="M10.5 3.5v5.2L5.2 17.6A1.6 1.6 0 0 0 6.6 20h10.8a1.6 1.6 0 0 0 1.4-2.4l-5.3-8.9V3.5" /><path d="M7.9 14.2h8.2" /></>),
    package: (<><path d="M12 3.5l8 4.2v8.6l-8 4.2-8-4.2V7.7z" /><path d="M4 7.7l8 4.2 8-4.2M12 11.9v8.6" /></>),
    tube: (<><path d="M8.5 3.5h7M9.7 3.5v13.2a2.3 2.3 0 0 0 4.6 0V3.5" /><path d="M9.7 12h4.6" /></>),
    article: (<><path d="M6 4.5h9.5L19 8v11.5H6z" /><path d="M15 4.5v4h4M9 12h7M9 15.5h7" /></>),
    calc: (<><rect x="6" y="3.5" width="12" height="17" rx="2" /><path d="M9 7.5h6M9.5 12h.01M12 12h.01M14.5 12h.01M9.5 15.5h.01M12 15.5h.01M14.5 15.5h.01" /></>),
    search: (<><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></>),
    table: (<><rect x="4" y="5" width="16" height="14" rx="2" /><path d="M4 10h16M10 5v14" /></>),
    swap: <path d="M7 8h12l-3-3M17 16H5l3 3" />,
    printer: (<><path d="M7 9V4.5h10V9M7 17.5H5.5a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v6.5a1 1 0 0 1-1 1H17" /><rect x="7" y="14" width="10" height="6" rx="1" /></>),
    trash: <path d="M5 7h14M10 7V4.5h4V7M7 7l.8 12.5h8.4L17 7" />,
    plus: <path d="M12 5v14M5 12h14" />,
    x: <path d="M6 6l12 12M18 6L6 18" />,
    back: <path d="M19 12H5M11 6l-6 6 6 6" />,
    chevron: <path d="M9.5 6l6 6-6 6" />,
};

export const Icon = ({ name, size = 18, stroke = 1.6, className = '', style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={`lab-svg ${className}`} style={style} aria-hidden="true">
        {PATHS[name]}
    </svg>
);
