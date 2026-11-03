import React from 'react';

// Icona della contabilità: foglio con angolo piegato, una riga e un cerchio (moneta). Tratto 1.6, colore = testo.
export const InvoiceIcon = ({ size = '1em', className = '' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M14.5 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V7.5z" />
        <path d="M14.5 3.5v3a1 1 0 0 0 1 1h3" />
        <circle cx="12" cy="14" r="2.6" />
        <path d="M8.8 10h2.4" />
    </svg>
);
