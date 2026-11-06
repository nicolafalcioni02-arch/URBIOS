import React from 'react';
import { Button } from 'glisse';

// Tasto a pillola in vetro (glisse) per il telefono: `light` = vetro neutro, altrimenti pieno nero (azione principale)
export const Pill = ({ light, className = '', ...rest }) => (
    <Button className={`m-gpill ${className}`} variant={light ? 'glass' : 'filled'} tint={light ? undefined : 'var(--ink)'} {...rest} />
);
