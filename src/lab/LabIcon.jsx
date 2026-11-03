import React from 'react';

// Icona del Laboratorio: beuta (matraccio di Erlenmeyer) con il livello del liquido. Tratto 1.6, colore = testo.
export const LabIcon = ({ size = '1em', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M9.5 3.5h5" />
        <path d="M10.5 3.5v5.2L5.2 17.6A1.6 1.6 0 0 0 6.6 20h10.8a1.6 1.6 0 0 0 1.4-2.4l-5.3-8.9V3.5" />
        <path d="M7.9 14.2h8.2" />
    </svg>
);
