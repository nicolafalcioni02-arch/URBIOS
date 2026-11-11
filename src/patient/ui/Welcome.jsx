import React from 'react';
import { AuthShell, Icon } from './bits.jsx';

// Prima schermata (nessun accesso creato su questo telefono).
export const Welcome = ({ onStart }) => (
    <AuthShell big title="Il tuo piano, sempre con te">
        <ul className="pt-feat">
            <li><Icon name="eyeoff" size={24} /><b>Anonima</b></li>
            <li><Icon name="lock" size={24} /><b>Cifrata</b></li>
            <li><Icon name="phone" size={24} /><b>Tua</b></li>
        </ul>
        <button type="button" className="pt-cta" onClick={onStart}>Inizia</button>
    </AuthShell>
);
