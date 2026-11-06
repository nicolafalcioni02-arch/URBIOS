import React from 'react';

// Icone delle Impostazioni: SVG a tratto unico, 24x24, colore = currentColor.
// Per aggiungerne una: una voce in PATHS (solo il contenuto dell'<svg>), poi <Icon name="..." />.
const PATHS = {
    user: (
        <>
            <circle cx="12" cy="8" r="3.6" />
            <path d="M4.8 20c.9-3.6 3.7-5.6 7.2-5.6s6.3 2 7.2 5.6" />
        </>
    ),
    building: (
        <>
            <path d="M4 20.5h16M6 20.5V5.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15M15 9.5h3a1 1 0 0 1 1 1v10" />
            <path d="M9 8.5h3M9 12h3M9 15.5h3" />
        </>
    ),
    receipt: (
        <>
            <path d="M6 3.5h12v17l-2.4-1.5-2.4 1.5-2.4-1.5-2.4 1.5L6 20.5z" />
            <path d="M9 8h6M9 11.5h6M9 15h3.5" />
        </>
    ),
    document: (
        <>
            <path d="M13.5 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8.5z" />
            <path d="M13.5 3.5v5h5M9 13h6M9 16.5h4" />
        </>
    ),
    palette: (
        <>
            <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.2 0 1.8-.8 1.8-1.7 0-1.2-1-1.5-1-2.6 0-1 .8-1.7 1.8-1.7h2.1a3.8 3.8 0 0 0 3.8-3.8C20.5 6.9 16.7 3.5 12 3.5z" />
            <circle cx="7.8" cy="11" r=".9" />
            <circle cx="10.5" cy="7.6" r=".9" />
            <circle cx="14.8" cy="7.8" r=".9" />
        </>
    ),
    function: (
        <>
            <path d="M14.5 4.5c-2 0-2.8 1.2-3.2 3.3L9.6 16.4c-.4 2-1.2 3.1-3.1 3.1" />
            <path d="M8 10h7.5M13.5 13.5l5 5M18.5 13.5l-5 5" />
        </>
    ),
    exchange: <path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5" />,
    shield: (
        <>
            <path d="M12 3.5 5 6v5.2c0 4.4 2.9 8 7 9.3 4.1-1.3 7-4.9 7-9.3V6z" />
            <path d="m9 12 2.2 2.2L15.2 10" />
        </>
    ),
    quote: (
        <>
            <path d="M5 17.5c2.6-.4 4-2.2 4-5.2V8.5H5V12h4" />
            <path d="M14 17.5c2.6-.4 4-2.2 4-5.2V8.5h-4V12h4" />
        </>
    ),
    info: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 11v5.5M12 7.6v.1" />
        </>
    ),
    chevronLeft: <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />,
    chevronRight: <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
    link: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    copy: (
        <>
            <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
            <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
        </>
    ),
    trash: (
        <>
            <path d="M4.5 7h15M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12" />
            <path d="M10 11v5.5M14 11v5.5" />
        </>
    ),
    lock: (
        <>
            <rect x="5" y="10.5" width="14" height="10" rx="2" />
            <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
        </>
    ),
    download: <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M4.5 19.5h15" />,
    upload: <path d="M12 15.5V4.5m0 0L7.5 9M12 4.5 16.5 9M4.5 19.5h15" />,
    save: (
        <>
            <path d="M5 4.5h11l3 3V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19z" />
            <path d="M8 4.5v4h7v-4M8 20.5v-6h8v6" />
        </>
    ),
    logout: <path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14M10 12h10m0 0-3.5-3.5M20 12l-3.5 3.5" />,
    alert: (
        <>
            <path d="M10.6 4.8 3.4 17.5A1.6 1.6 0 0 0 4.8 20h14.4a1.6 1.6 0 0 0 1.4-2.5L13.4 4.8a1.6 1.6 0 0 0-2.8 0z" />
            <path d="M12 9.5v4.5M12 16.8v.1" />
        </>
    ),
    clipboard: (
        <>
            <rect x="5.5" y="5" width="13" height="15.5" rx="2" />
            <path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M9 11h6M9 14.5h4" />
        </>
    ),
    template: (
        <>
            <rect x="4.5" y="4.5" width="15" height="15" rx="2" />
            <path d="M4.5 9.5h15M9.5 9.5v10" />
        </>
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2" />
        </>
    ),
    search: (
        <>
            <circle cx="11" cy="11" r="6" />
            <path d="m19.5 19.5-4.2-4.2" />
        </>
    ),
};

export const ICON_NAMES = Object.keys(PATHS);

export const Icon = ({ name, size = 18, stroke = 1.6, className = '', style }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={`st-svg ${className}`}
        style={style}
    >
        {PATHS[name] || PATHS.info}
    </svg>
);
