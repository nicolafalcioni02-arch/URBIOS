import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FormulasTab } from './tabs/FormulasTab';
import { InfoTab } from './tabs/InfoTab';
import { CiteTab } from './tabs/CiteTab';
import { LookTab } from './tabs/LookTab';
import { SecurityTab } from './tabs/SecurityTab';
import { DataExchangeTab } from './tabs/dataExchange/DataExchangeTab';
import { ProfileTab } from './tabs/profile/ProfileTab';
import { useCompact } from '../../hooks/useCompact';

const SECTIONS = [
    ['profilo', 'ph-user-circle', 'Profilo e studio', 'Dati, orari, sedi, contratto', '#3B5BDB'],
    ['aspetto', 'ph-paint-brush', 'Aspetto', 'Classico o Vetro', '#B59A12'],
    ['formule', 'ph-function', 'Formule', 'Equazioni per i calcoli', '#0C8F7E'],
    ['dati', 'ph-arrows-left-right', 'Importa ed esporta', 'CSV, documenti, anonimo', '#C26A1B'],
    ['sicurezza', 'ph-shield-check', 'Sicurezza e archivio', 'Cifratura e file', '#C23A64'],
    ['cita', 'ph-quotes', 'Come citarci', 'Per tesi e pubblicazioni', '#0C8F7E'],
    ['info', 'ph-info', 'Info software', 'Versione e crediti', '#7C4DDB'],
];

export const SettingsModal = ({ db, onUpdateDb, onClose }) => {
    const compact = useCompact(639);
    // su telefono si parte dall'elenco delle sezioni (tab = null) e si entra con un tocco
    const [tab, setTab] = useState(compact ? null : 'profilo');
    const [localUser, setLocalUser] = useState(db.utente);

    // Stato per la gestione delle formule
    const [showAddFormula, setShowAddFormula] = useState(false);
    const [newFormula, setNewFormula] = useState({ categoria: 'Generale', titolo: '', equazione: '', note: '' });

    // Funzione helper per aggiornare i campi del profilo
    const updateUser = (name, value) => {
        setLocalUser((prev) => ({ ...prev, [name]: value }));
    };

    // Salva Profilo
    const handleSaveProfile = () => {
        onUpdateDb((prev) => ({ ...prev, utente: localUser }));
        alert('Tutte le impostazioni del profilo sono state salvate!');
    };

    // Aggiungi Formula
    const handleAddFormula = () => {
        if (!newFormula.titolo || !newFormula.equazione) {
            alert('Inserisci almeno Titolo ed Equazione.');
            return;
        }
        const formulaToAdd = { ...newFormula, id: Date.now() };

        onUpdateDb((prev) => ({
            ...prev,
            formule: [formulaToAdd, ...(prev.formule || [])],
        }));

        setNewFormula({ categoria: 'Generale', titolo: '', equazione: '', note: '' });
        setShowAddFormula(false);
    };

    // Elimina Formula
    const handleDeleteFormula = (id) => {
        if (confirm('Vuoi rimuovere questa formula dal database?')) {
            onUpdateDb((prev) => ({
                ...prev,
                formule: prev.formule.filter((f) => f.id !== id),
            }));
        }
    };

    const current = SECTIONS.find((x) => x[0] === tab);
    const body = (
        <>
            <ProfileTab handleSaveProfile={handleSaveProfile} localUser={localUser} tab={tab} updateUser={updateUser} />
            <FormulasTab
                db={db}
                handleAddFormula={handleAddFormula}
                handleDeleteFormula={handleDeleteFormula}
                newFormula={newFormula}
                setNewFormula={setNewFormula}
                setShowAddFormula={setShowAddFormula}
                showAddFormula={showAddFormula}
                tab={tab}
            />
            <DataExchangeTab tab={tab} db={db} onUpdateDb={onUpdateDb} />
            <SecurityTab tab={tab} onClose={onClose} />
            <InfoTab tab={tab} />
            <CiteTab tab={tab} />
            <LookTab tab={tab} db={db} onUpdateDb={onUpdateDb} />
        </>
    );

    if (compact)
        return ReactDOM.createPortal(
            <div className="fixed inset-0 z-[9999] m-shell m-settings slide-in-right">
                <header className="m-nav is-solid">
                    <div className="m-nav-side">
                        {tab ? (
                            <button className="m-back" onClick={() => setTab(null)}>
                                <i className="ph ph-caret-left"></i>Impostazioni
                            </button>
                        ) : null}
                    </div>
                    <span className="m-nav-title is-on">{current ? current[2] : 'Impostazioni'}</span>
                    <div className="m-nav-side end">
                        <button className="m-back" style={{ fontWeight: 600, paddingRight: 10 }} onClick={onClose}>
                            Fine
                        </button>
                    </div>
                </header>
                <div className="m-scroll">
                    {tab ? (
                        <div key={tab} className="m-settings-body rise">
                            {body}
                        </div>
                    ) : (
                        <>
                            <div className="m-large rise">
                                <h1>Impostazioni</h1>
                                <p>Il tuo studio, le formule e l'archivio</p>
                            </div>
                            <div className="m-group rise" style={{ animationDelay: '.06s', marginTop: 18 }}>
                                {SECTIONS.map(([id, icon, label, sub, c]) => (
                                    <button key={id} className="m-row" onClick={() => setTab(id)}>
                                        <span className="m-ico" style={{ '--c': c }}>
                                            <i className={`ph-fill ${icon}`}></i>
                                        </span>
                                        <span className="m-row-body">
                                            <span className="m-row-text">
                                                <span className="m-row-title">{label}</span>
                                                <span className="m-row-sub">{sub}</span>
                                            </span>
                                            <i className="ph-bold ph-caret-right m-chev"></i>
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-center text-[12px] text-[color:var(--muted)] mt-6">© URBIOS Software</p>
                        </>
                    )}
                    <div style={{ height: 32 }}></div>
                </div>
            </div>,
            document.body
        );

    return ReactDOM.createPortal(
        <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 fade-enter">
            <div className="bg-white w-full max-w-5xl h-full md:h-[85vh] rounded-none md:rounded-2xl shadow-2xl flex overflow-hidden">
                {/* SIDEBAR */}
                <div className="w-72 bg-[var(--paper)] border-r border-[color:var(--line)] p-5 flex flex-col justify-between hidden md:flex">
                    <div>
                        <h2 className="text-[22px] font-semibold text-[color:var(--ink)] mb-6 px-2">Impostazioni</h2>
                        <nav className="space-y-1">
                            {SECTIONS.map(([id, icon, label, sub, c]) => (
                                <button key={id} onClick={() => setTab(id)} className={`set-side ${tab === id ? 'on' : ''}`}>
                                    <span className="m-ico" style={{ '--c': c }}>
                                        <i className={`ph-fill ${icon}`}></i>
                                    </span>
                                    <span className="min-w-0 text-left">
                                        <span className="block text-[14px] font-semibold leading-tight truncate">{label}</span>
                                        <span className="block text-[11.5px] opacity-60 leading-tight truncate mt-0.5">{sub}</span>
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="text-xs text-[color:var(--muted)] text-center"> © URBIOS Software</div>
                </div>

                {/* CONTENUTO */}
                <div className="flex-1 min-w-0 overflow-y-auto p-4 md:p-8 relative bg-white">
                    {/* SCHEDE PER TELEFONO/TABLET (la barra laterale compare solo da md in su) */}
                    <div className="md:hidden sticky -top-4 z-40 -mx-4 -mt-4 mb-4 h-16 flex items-center gap-2 pl-4 pr-16 bg-white/95 backdrop-blur border-b border-gray-100 overflow-x-auto no-scrollbar">
                        {[
                            ['profilo', 'ph-user-circle', 'Profilo'],
                            ['aspetto', 'ph-paint-brush', 'Aspetto'],
                            ['formule', 'ph-function', 'Formule'],
                            ['dati', 'ph-arrows-left-right', 'Dati'],
                            ['sicurezza', 'ph-shield-check', 'Sicurezza'],
                            ['cita', 'ph-quotes', 'Citaci'],
                            ['info', 'ph-info', 'Info'],
                        ].map(([id, icon, label]) => (
                            <button
                                key={id}
                                onClick={() => setTab(id)}
                                className={`flex-none flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${tab === id ? 'bg-black text-white shadow' : 'bg-gray-100 text-gray-500'}`}
                            >
                                <i className={`ph ${icon} text-base`}></i> {label}
                            </button>
                        ))}
                    </div>

                    {/* TASTO CHIUDI (X) - Con z-index alto e posizionamento sicuro */}
                    <button
                        onClick={onClose}
                        className="fixed md:absolute top-3 right-3 md:top-4 md:right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-50"
                    >
                        <i className="ph ph-x text-xl"></i>
                    </button>

                    {/* --- TAB PROFILO --- */}
                    {/* --- TAB PROFILO --- */}
                    {<ProfileTab handleSaveProfile={handleSaveProfile} localUser={localUser} tab={tab} updateUser={updateUser} />}

                    {/* --- TAB FORMULE --- */}
                    {
                        <FormulasTab
                            db={db}
                            handleAddFormula={handleAddFormula}
                            handleDeleteFormula={handleDeleteFormula}
                            newFormula={newFormula}
                            setNewFormula={setNewFormula}
                            setShowAddFormula={setShowAddFormula}
                            showAddFormula={showAddFormula}
                            tab={tab}
                        />
                    }

                    {/* --- TAB INFO --- */}
                    <DataExchangeTab tab={tab} db={db} onUpdateDb={onUpdateDb} />

                    <SecurityTab tab={tab} onClose={onClose} />

                    {<InfoTab tab={tab} />}
                    <CiteTab tab={tab} />
                    <LookTab tab={tab} db={db} onUpdateDb={onUpdateDb} />
                </div>
            </div>
        </div>,

        document.body
    );
};
