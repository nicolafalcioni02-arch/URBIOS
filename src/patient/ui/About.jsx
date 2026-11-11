import React from 'react';
import { Icon } from './bits.jsx';
import { UrbiosLogo } from '../../brand/UrbiosLogo.jsx';

// Team come in «Impostazioni → Informazioni» del programma del medico (src/views/settings/tabs/about/InfoTab.jsx): tenerlo allineato.
const TEAM = [
    ['Dott. Nicola Falcioni', 'Founder & Chief Executive Officer'],
    ['Dott.ssa Ilaria Berardi', 'Science Team'],
    ['Dott.ssa Nicole Bellanova', 'Science Team'],
    ['Dott. Lorenzo Frattini', 'Science Team'],
    ['Dott. Riccardo Giardini', 'Science Team'],
    ['Dott.ssa Silvia Planchenstainer', 'Science Team'],
    ['Dott. Elia Falcioni', 'External Consultant'],
];
const initials = (n) => n.replace(/^Dott\.(ssa)?\s/, '').split(' ').map((w) => w[0]).join('');

export const About = ({ onClose }) => (
    <div className="pt-ab" role="dialog" aria-modal="true" aria-label="Chi è URBIOS">
        <header className="pt-ab-h"><button type="button" className="pt-round" aria-label="Chiudi" onClick={onClose}><Icon name="back" /></button></header>
        <div className="pt-ab-s">
            <div className="pt-ab-hero"><UrbiosLogo size={64} /><b>URBIOS</b></div>

            <h3>Il team</h3>
            <div className="pt-ab-team">{TEAM.map(([n, r]) => <div key={n}><i>{initials(n)}</i><span><b>{n}</b><small>{r}</small></span></div>)}</div>
            <p className="pt-credits is-end">Figure anatomiche: <a href="https://github.com/MichaelMjc/react-body-highlighter" target="_blank" rel="noopener noreferrer">react-body-highlighter</a> (licenza MIT), © Hicham Elabbassi.</p>
        </div>
    </div>
);
