import React from 'react';
import { AuthShell } from './bits.jsx';

// Prima schermata (nessun accesso creato su questo telefono).
export const Welcome = ({ onStart }) => (
    <AuthShell big title="Il tuo piano, sempre con te" sub="Piano alimentare e scheda di allenamento.">
        <ul className="pt-feat">
            <li><b>Anonima</b></li>
            <li><b>Cifrata</b></li>
            <li><b>Tua</b></li>
        </ul>
        <button type="button" className="pt-cta" onClick={onStart}>Inizia</button>
    </AuthShell>
);
