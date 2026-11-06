import React from 'react';
import { Button, SegmentedControl } from 'glisse';
import { Icon } from './icons';

// Kit delle Impostazioni: gli unici mattoni da usare nelle schede (stile in ../settings.css, classi st-*).
// Colori: solo i token di index.css (--ink, --muted, --line, --surface, --soft, --ok, --warn, --bad).

// Pagina di una scheda: titolo, frase di apertura, azioni a destra
export const Page = ({ title, intro, actions, children, narrow }) => (
    <div className={`st-page fade-enter ${narrow ? 'is-narrow' : ''}`}>
        <header className="st-page-head">
            <div className="min-w-0">
                <h3 className="st-title">{title}</h3>
                {intro && <p className="st-intro">{intro}</p>}
            </div>
            {actions && <div className="st-page-actions">{actions}</div>}
        </header>
        {children}
    </div>
);

// Gruppo di impostazioni (pannello con titolo)
export const Group = ({ title, hint, icon, aside, children, className = '' }) => (
    <section className={`panel st-group ${className}`}>
        {(title || aside) && (
            <div className="st-group-head">
                {icon && <Icon name={icon} size={17} className="st-group-ico" />}
                <div className="min-w-0 flex-1">
                    {title && <h4 className="st-group-title">{title}</h4>}
                    {hint && <p className="st-hint">{hint}</p>}
                </div>
                {aside}
            </div>
        )}
        {children}
    </section>
);

// Etichetta piccola sopra un blocco (es. "Il team")
export const Label = ({ children, className = '' }) => <p className={`st-label ${className}`}>{children}</p>;

// variant: primary (inchiostro) | secondary (bordo) | ghost (solo testo) | danger (testo rosso)
export const Btn = ({ children, variant = 'primary', icon, size, className = '', ...props }) => (
    <button type="button" {...props} className={`st-btn is-${variant} ${size === 'sm' ? 'is-sm' : ''} ${className}`}>
        {icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} />}
        {children}
    </button>
);

// Bottone solo icona in vetro (glisse): chiudi, elimina...
export const IconBtn = ({ icon, label, className = '', ...props }) => (
    <Button type="button" aria-label={label} title={label} {...props} className={`st-iconbtn ${className}`} icon={<Icon name={icon} size={18} />} />
);

export const Check = ({ label, hint, checked, onChange, disabled }) => (
    <label className={`st-choice ${disabled ? 'is-off' : ''}`}>
        <input type="checkbox" checked={!!checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span>
            {label}
            {hint && <span className="st-choice-hint">{hint}</span>}
        </span>
    </label>
);

export const Radio = ({ name, value, current, onChange, label, hint }) => (
    <label className="st-choice">
        <input type="radio" name={name} checked={current === value} onChange={() => onChange(value)} />
        <span>
            {label}
            {hint && <span className="st-choice-hint">{hint}</span>}
        </span>
    </label>
);

export const Select = ({ value, onChange, options }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="fld">
        {options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
                {o.label ?? o}
            </option>
        ))}
    </select>
);

// Campo controllato semplice (per password, ricerche...). Per i dati del profilo usare InputGroup (salva all'uscita dal campo).
export const Field = ({ label, className = '', ...props }) => (
    <label className={`block ${className}`}>
        {label && <span className="fld-label">{label}</span>}
        <input {...props} className="fld" />
    </label>
);

// Interruttore a due o più voci (glisse: la lente segue il dito)
export const Segmented = ({ options, value, onChange }) => (
    <SegmentedControl aria-label="Scelta" items={options.map(([k, l]) => ({ value: k, label: l }))} value={value} onValueChange={onChange} />
);

// Nota/avviso. tone: neutral | ok | warn | bad (cambia solo il filo a sinistra e l'icona, non lo sfondo)
const TONE_ICON = { neutral: 'info', ok: 'check', warn: 'alert', bad: 'alert' };
export const Note = ({ tone = 'neutral', icon, title, children, className = '' }) => (
    <div className={`st-note is-${tone} ${className}`}>
        <Icon name={icon || TONE_ICON[tone]} size={17} className="st-note-ico" />
        <div className="min-w-0">
            {title && <p className="st-note-title">{title}</p>}
            {children}
        </div>
    </div>
);

// Stato con pallino (es. "Cifrato")
export const Status = ({ tone = 'neutral', children }) => <span className={`st-status is-${tone}`}>{children}</span>;
