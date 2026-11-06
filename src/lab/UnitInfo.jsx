import React, { useState } from 'react';
import { Icon } from './ui/icons';
import { DIMS, UNIT_NAMES, unitSentences } from './unitConv';

// Tasto «i»: come si chiamano le unità (µg = microgrammo…) e quanto valgono, con esempi tipo «10 milligrammi sono 0,01 grammi».
const GROUPS = ['g', 'mol', 'L', 'M'];

export const UnitInfo = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button type="button" className="ui-i" onClick={() => setOpen(true)} aria-label="Come si chiamano le unità"><Icon name="info" size={18} /></button>
            {open && (
                <div className="ui-back" onClick={() => setOpen(false)}>
                    <div className="ui-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Unità di misura">
                        <header><h3>Unità di misura</h3><button type="button" onClick={() => setOpen(false)} aria-label="Chiudi"><Icon name="x" size={20} /></button></header>
                        <div className="ui-body">
                            {GROUPS.map((g) => {
                                const base = Object.keys(DIMS[g].units).find((u) => DIMS[g].units[u] === 1);
                                return (
                                    <section key={g}>
                                        <h4>{DIMS[g].label}</h4>
                                        <p className="ui-base"><b>{base}</b> = {UNIT_NAMES[base][0]}</p>
                                        {unitSentences(g).map((s) => (
                                            <div key={s.unit} className="ui-row"><span><b>{s.unit}</b> = {s.name}</span><small>{s.text}</small></div>
                                        ))}
                                    </section>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
