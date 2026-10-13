import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FormulasTab } from './tabs/FormulasTab';
import { InfoTab } from './tabs/InfoTab';
import { SecurityTab } from './tabs/SecurityTab';
import { DataExchangeTab } from './tabs/dataExchange/DataExchangeTab';
import { ProfileTab } from './tabs/profile/ProfileTab';

export const SettingsModal = ({ db, onUpdateDb, onClose }) => {
    const [tab, setTab] = useState('profilo');
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

    return ReactDOM.createPortal(
        <div className="fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 fade-enter">
            <div className="bg-white w-full max-w-5xl h-full md:h-[85vh] rounded-none md:rounded-2xl shadow-2xl flex overflow-hidden">
                {/* SIDEBAR */}
                <div className="w-64 bg-gray-50 border-r border-gray-100 p-6 flex flex-col justify-between hidden md:flex">
                    <div>
                        <h2 className="font-[Helvetica] text-xl font-bold mb-8">Impostazioni</h2>
                        <nav className="space-y-2">
                            <button
                                onClick={() => setTab('profilo')}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex-row items-center ${tab === 'profilo' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <i className="ph ph-user-circle text-lg mr-2"></i> Profilo & Studio
                            </button>
                            <button
                                onClick={() => setTab('formule')}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex-row items-center ${tab === 'formule' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <i className="ph ph-function text-lg mr-2"></i> Gestione Formule
                            </button>
                            <button
                                onClick={() => setTab('dati')}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex-row items-center ${tab === 'dati' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <i className="ph ph-arrows-left-right text-lg mr-2"></i> Importa & Esporta
                            </button>
                            <button
                                onClick={() => setTab('sicurezza')}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex-row items-center ${tab === 'sicurezza' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <i className="ph ph-shield-check text-lg mr-2"></i> Sicurezza & Archivio
                            </button>
                            <button
                                onClick={() => setTab('info')}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex-row items-center  ${tab === 'info' ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
                            >
                                <i className="ph ph-info text-lg mr-2"></i> Info Software
                            </button>
                        </nav>
                    </div>
                    <div className="text-xs text-gray-400 text-center"> © URBIOS Software</div>
                </div>

                {/* CONTENUTO */}
                <div className="flex-1 min-w-0 overflow-y-auto p-4 md:p-8 relative bg-white">
                    {/* SCHEDE PER TELEFONO/TABLET (la barra laterale compare solo da md in su) */}
                    <div className="md:hidden sticky -top-4 z-40 -mx-4 -mt-4 mb-4 h-16 flex items-center gap-2 pl-4 pr-16 bg-white/95 backdrop-blur border-b border-gray-100 overflow-x-auto no-scrollbar">
                        {[
                            ['profilo', 'ph-user-circle', 'Profilo'],
                            ['formule', 'ph-function', 'Formule'],
                            ['dati', 'ph-arrows-left-right', 'Dati'],
                            ['sicurezza', 'ph-shield-check', 'Sicurezza'],
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
                </div>
            </div>
        </div>,

        document.body
    );
};
