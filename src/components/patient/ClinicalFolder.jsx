import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { InputGroup, TextAreaGroup } from '../ui/InputGroup';
import { Button } from '../ui/Button';
import { LetteraIncaricoModal } from '../reports/LetteraIncaricoModal';

export const ClinicalFolder = ({ patient, updatePatientInfo, professionalData }) => {
    const [showLettera, setShowLettera] = useState(false);

    return (
        <div className="fade-enter grid grid-cols-1 xl:grid-cols-2 gap-8 pb-32">
            <div className="space-y-6">
                <Card title="Dati Amministrativi" icon="ph-identification-card">
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Nome" value={patient.nome} name="nome" onChange={updatePatientInfo} />
                        <InputGroup label="Cognome" value={patient.cognome} name="cognome" onChange={updatePatientInfo} />
                        <InputGroup label="Sesso Biologico" options={['M', 'F']} value={patient.sesso || 'M'} name="sesso" onChange={updatePatientInfo} />
                        <InputGroup label="Data di Nascita" type="date" value={patient.dataNascita} name="dataNascita" onChange={updatePatientInfo} />
                        <InputGroup
                            label="Luogo di Nascita"
                            placeholder="Comune (PR)"
                            value={patient.luogoNascita}
                            name="luogoNascita"
                            onChange={updatePatientInfo}
                        />
                        <InputGroup label="Codice Fiscale" placeholder="16 caratteri" full value={patient.cf} name="cf" onChange={updatePatientInfo} />
                        <InputGroup
                            label="Professione"
                            placeholder="Es. Impiegato"
                            value={patient.professione}
                            name="professione"
                            onChange={updatePatientInfo}
                        />
                        <InputGroup
                            label="Stato Civile"
                            options={['Celibe/Nubile', 'Coniugato/a', 'Divorziato/a', 'Vedovo/a']}
                            value={patient.statoCivile}
                            name="statoCivile"
                            onChange={updatePatientInfo}
                        />
                    </div>
                </Card>
                <Card title="Recapiti" icon="ph-address-book">
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Cellulare" type="tel" placeholder="+39..." value={patient.cellulare} name="cellulare" onChange={updatePatientInfo} />
                        <InputGroup label="Email" type="email" full value={patient.email} name="email" onChange={updatePatientInfo} />
                        <InputGroup label="Indirizzo" placeholder="Via..." full value={patient.indirizzo} name="indirizzo" onChange={updatePatientInfo} />
                        <InputGroup label="CAP" placeholder="00000" value={patient.cap} name="cap" onChange={updatePatientInfo} />
                        <InputGroup label="Città" placeholder="Milano" value={patient.citta} name="citta" onChange={updatePatientInfo} />
                    </div>
                </Card>
            </div>
            <div className="space-y-6">
                <Card title="Anamnesi Medica Remota" icon="ph-folder-lock">
                    <div className="space-y-4">
                        <TextAreaGroup
                            label="Anamnesi Familiare"
                            placeholder="Diabete, Ipertensione, Obesità in famiglia..."
                            name="anamnesi_familiare"
                            value={patient.anamnesi_familiare}
                            onChange={updatePatientInfo}
                        />
                        <TextAreaGroup
                            label="Patologie Pregresse & Interventi"
                            placeholder="Elenco patologie diagnosticate..."
                            name="patologie"
                            value={patient.patologie}
                            onChange={updatePatientInfo}
                        />
                        <TextAreaGroup
                            label="Terapie Farmacologiche Croniche"
                            placeholder="Farmaci assunti regolarmente..."
                            name="farmaci"
                            value={patient.farmaci}
                            onChange={updatePatientInfo}
                        />
                        <TextAreaGroup
                            label="Allergie & Intolleranze"
                            placeholder="Nichel, Glutine, Lattosio..."
                            name="allergie"
                            value={patient.allergie}
                            onChange={updatePatientInfo}
                        />
                    </div>
                </Card>
                <Card title="Note Generali" icon="ph-note-pencil">
                    <TextAreaGroup
                        label="Obiettivo del Paziente"
                        placeholder="Perdita peso, Performance, Ricomposizione..."
                        rows={4}
                        name="obiettivo"
                        value={patient.obiettivo}
                        onChange={updatePatientInfo}
                    />
                </Card>

                {/* BOTTONE GENERA LETTERA */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                        <i className="ph-duotone ph-file-signature text-2xl text-black"></i>
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Contrattualistica</h4>
                        <p className="text-xs text-gray-500 max-w-xs mx-auto">
                            Genera la Lettera di Incarico e Privacy precompilata con i dati del paziente e le tue impostazioni.
                        </p>
                    </div>
                    <Button onClick={() => setShowLettera(true)} variant="primary" className="w-full justify-center">
                        Genera Lettera di Incarico
                    </Button>
                </div>
            </div>

            {/* MODALE LETTERA */}
            {showLettera && <LetteraIncaricoModal patient={patient} professional={professionalData || {}} onClose={() => setShowLettera(false)} />}
        </div>
    );
};
