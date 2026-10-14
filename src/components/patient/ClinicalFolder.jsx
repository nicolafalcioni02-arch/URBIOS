import React, { useState } from 'react';
import { InputGroup } from '../ui/InputGroup';
import { DocumentsPanel } from './info/DocumentsPanel';

// Scheda paziente: prima i documenti da firmare, poi i dati fissi (l'anamnesi e' il primo passo di Nuova visita) (anagrafica, recapiti)
export const ClinicalFolder = ({ patient, updatePatientInfo, professionalData }) => {
    const [anagraficaOpen, setAnagraficaOpen] = useState(!patient.cf && !patient.dataNascita);
    const riga = [patient.cf, patient.dataNascita, patient.cellulare, patient.email].filter(Boolean).join('  ·  ');

    return (
        <div className="anag-grid fade-enter grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-6 pb-32 items-start">
            <div className="space-y-6">
                <DocumentsPanel patient={patient} professionalData={professionalData} updatePatientInfo={updatePatientInfo} />
            </div>

            <div className="panel !p-0 overflow-hidden">
                <button
                    type="button"
                    onClick={() => setAnagraficaOpen((o) => !o)}
                    className="w-full flex items-center justify-between gap-3 text-left px-[18px] py-4 hover:bg-[color:var(--soft)] transition-colors"
                    aria-expanded={anagraficaOpen}
                >
                    <span className="flex items-center gap-2.5 min-w-0">
                        <i className="ph ph-identification-card text-[17px] text-[color:var(--muted)]"></i>
                        <span className="min-w-0">
                            <span className="block font-semibold text-[15px] text-[color:var(--ink)]">Anagrafica e recapiti</span>
                            {!anagraficaOpen && <span className="block text-[12px] text-[color:var(--muted)] truncate">{riga || 'Dati da compilare'}</span>}
                        </span>
                    </span>
                    <i className={`ph ph-caret-down text-[color:var(--muted)] transition-transform duration-300 ${anagraficaOpen ? 'rotate-180' : ''}`}></i>
                </button>
                {anagraficaOpen && (
                    <div className="px-[18px] pb-5 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Nome" value={patient.nome} name="nome" onChange={updatePatientInfo} />
                            <InputGroup label="Cognome" value={patient.cognome} name="cognome" onChange={updatePatientInfo} />
                            <InputGroup label="Sesso biologico" options={['M', 'F']} value={patient.sesso || 'M'} name="sesso" onChange={updatePatientInfo} />
                            <InputGroup label="Data di nascita" type="date" value={patient.dataNascita} name="dataNascita" onChange={updatePatientInfo} />
                            <InputGroup label="Luogo di nascita" placeholder="Comune (PR)" value={patient.luogoNascita} name="luogoNascita" onChange={updatePatientInfo} />
                            <InputGroup label="Professione" placeholder="Es. Impiegato" value={patient.professione} name="professione" onChange={updatePatientInfo} />
                            <InputGroup label="Codice fiscale" placeholder="16 caratteri" full value={patient.cf} name="cf" onChange={updatePatientInfo} />
                            <InputGroup
                                label="Stato civile"
                                options={['Celibe/Nubile', 'Coniugato/a', 'Divorziato/a', 'Vedovo/a']}
                                value={patient.statoCivile}
                                name="statoCivile"
                                onChange={updatePatientInfo}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-5 border-t" style={{ borderColor: 'var(--line)' }}>
                            <InputGroup label="Cellulare" type="tel" placeholder="+39..." value={patient.cellulare} name="cellulare" onChange={updatePatientInfo} />
                            <InputGroup label="Email" type="email" value={patient.email} name="email" onChange={updatePatientInfo} />
                            <InputGroup label="Indirizzo" placeholder="Via..." full value={patient.indirizzo} name="indirizzo" onChange={updatePatientInfo} />
                            <InputGroup label="CAP" placeholder="00000" value={patient.cap} name="cap" onChange={updatePatientInfo} />
                            <InputGroup label="Città" placeholder="Milano" value={patient.citta} name="citta" onChange={updatePatientInfo} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
