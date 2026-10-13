import React from 'react';
import { Card } from '../../../../../components/ui/Card';
import { InputGroup } from '../../../../../components/ui/InputGroup';

export const PersonalDataSection = ({ localUser, updateUser }) => {
    return (
        <Card title="1. Dati Anagrafici" icon="ph-identification-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Nome" value={localUser.nome} name="nome" onChange={updateUser} />
                <InputGroup label="Cognome" value={localUser.cognome} name="cognome" onChange={updateUser} />
                <InputGroup label="Data di Nascita" type="date" value={localUser.data_nascita} name="data_nascita" onChange={updateUser} />
                <InputGroup label="Luogo di Nascita" value={localUser.luogo_nascita} name="luogo_nascita" onChange={updateUser} />
                <InputGroup label="Codice Fiscale" value={localUser.codice_fiscale} name="codice_fiscale" onChange={updateUser} />
                <InputGroup label="Indirizzo Residenza" value={localUser.indirizzo_residenza} name="indirizzo_residenza" onChange={updateUser} />
                <InputGroup label="Telefono" value={localUser.telefono} name="telefono" onChange={updateUser} />
                <InputGroup label="Email Personale" value={localUser.email} name="email" onChange={updateUser} />
                <InputGroup label="PEC Personale" value={localUser.pec_personale} name="pec_personale" onChange={updateUser} />
                <InputGroup
                    label="Firma Digitale (Testo)"
                    placeholder="Es. Firmato digitalmente da..."
                    value={localUser.firma_digitale}
                    name="firma_digitale"
                    onChange={updateUser}
                />
            </div>
        </Card>
    );
};
