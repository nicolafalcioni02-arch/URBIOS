import React, { useState } from 'react';
import { isExample } from '../../storage/example/example';

// Elenco pazienti su telefono: titolo grande che si ritira nella barra scorrendo, ricerca sempre a portata,
// righe raggruppate. Le azioni secondarie stanno nella barra in basso (vedi ProfessionalSuite).
export const HomeMobile = ({ patients, list, query, setQuery, onOpen, onAdd, lastVisit, showSave, onSave }) => {
    const [scrolled, setScrolled] = useState(false);
    const count = patients.length;

    return (
        <div className="m-scroll" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 36)}>
            <header className={`m-nav ${scrolled ? 'is-scrolled' : ''}`}>
                <div className="m-nav-side">
                    <span className="m-brand">URBIOS</span>
                </div>
                <span className="m-nav-title">Pazienti</span>
                <div className="m-nav-side end">
                    {showSave && (
                        <button className="m-pill save" onClick={onSave}>
                            <i className="ph-bold ph-floppy-disk"></i>
                            Salva
                        </button>
                    )}
                    <button className="m-icon solid" onClick={onAdd} aria-label="Nuovo paziente">
                        <i className="ph-bold ph-plus"></i>
                    </button>
                </div>
            </header>

            <div className="m-large rise">
                <h1>Pazienti</h1>
                <p>{count === 0 ? 'Nessun paziente per ora' : `${count} ${count === 1 ? 'paziente' : 'pazienti'} in archivio`}</p>
            </div>

            {count > 0 && (
                <label className="m-search rise" style={{ animationDelay: '.04s' }}>
                    <i className="ph ph-magnifying-glass"></i>
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca" type="search" enterKeyHint="search" />
                </label>
            )}

            {list.length > 0 && (
                <div className="m-group rise" style={{ animationDelay: '.08s' }}>
                    {list.map((p) => {
                        const active = (p.status || 'Attivo') === 'Attivo';
                        return (
                            <button key={p.id} className="m-row" onClick={() => onOpen(p.id)}>
                                <span className="m-avatar">
                                    {p.nome.charAt(0)}
                                    {p.cognome.charAt(0)}
                                    {!active && <span className="m-avatar-off" title="Non attivo"></span>}
                                </span>
                                <span className="m-row-body">
                                    <span className="m-row-text">
                                        <span className="m-row-title">
                                            {p.nome} {p.cognome}
                                            {isExample(p) && <span className="ex-badge" title="Paziente di esempio: le modifiche non si salvano">Esempio</span>}
                                        </span>
                                        <span className="m-row-sub">{lastVisit(p)}</span>
                                    </span>
                                    <i className="ph-bold ph-caret-right m-chev"></i>
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {count === 0 && (
                <div className="m-empty rise" style={{ animationDelay: '.08s' }}>
                    <span className="m-empty-mark">
                        <i className="ph ph-user-plus"></i>
                    </span>
                    <p className="m-empty-title">Inizia dal primo paziente</p>
                    <p className="m-empty-sub">Basta nome e cognome, il resto lo aggiungi quando serve.</p>
                    <button onClick={onAdd} className="vw-next mx-auto mt-5">
                        <i className="ph-bold ph-plus"></i>
                        <span>Nuovo paziente</span>
                    </button>
                </div>
            )}
            {count > 0 && list.length === 0 && <p className="text-center text-[15px] text-[color:var(--muted)] py-12">Nessun risultato per "{query}"</p>}
            <div style={{ height: 24 }}></div>
        </div>
    );
};
