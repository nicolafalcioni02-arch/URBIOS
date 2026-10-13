import React from 'react';
import { Card } from '../../../../../components/ui/Card';
import { InputGroup } from '../../../../../components/ui/InputGroup';

export const ProfessionalDataSection = ({ localUser, updateUser }) => {
    return (
        <Card title="2. Dati Professionali" icon="ph-briefcase">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full">
                    <InputGroup
                        label="Qualifica / Titolo (Es. Dottore, Biologo...)"
                        placeholder="Es. Dott. Mario Rossi, Biologo Nutrizionista"
                        value={localUser.titolo_professionale}
                        name="titolo_professionale"
                        onChange={updateUser}
                    />
                </div>
                <InputGroup
                    label="Ordine di Appartenenza"
                    placeholder="Es. Ordine Nazionale Biologi"
                    value={localUser.ordine_appartenenza}
                    name="ordine_appartenenza"
                    onChange={updateUser}
                />
                <InputGroup label="Numero Iscrizione Albo" value={localUser.numero_albo} name="numero_albo" onChange={updateUser} />
                <div className="col-span-full">
                    <InputGroup
                        label="Specializzazioni / Master"
                        placeholder="Es. Master in Nutrizione Sportiva"
                        value={localUser.specializzazioni}
                        name="specializzazioni"
                        onChange={updateUser}
                    />
                </div>
                <InputGroup label="Partita IVA" value={localUser.p_iva} name="p_iva" onChange={updateUser} />
                <InputGroup label="Codice ATECO" value={localUser.codice_ateco} name="codice_ateco" onChange={updateUser} />
                <div className="col-span-full">
                    <InputGroup
                        label="Indirizzo Studio Principale"
                        placeholder="Via Roma 1, Milano"
                        value={localUser.indirizzo_studio}
                        name="indirizzo_studio"
                        onChange={updateUser}
                    />
                </div>
                <div className="col-span-full">
                    <InputGroup
                        label="Eventuali Sedi Multiple"
                        placeholder="Sede 2: Via..."
                        value={localUser.sedi_multiple}
                        name="sedi_multiple"
                        onChange={updateUser}
                    />
                </div>
                <div className="col-span-full">
                    <InputGroup label="URL Logo Studio" placeholder="https://..." value={localUser.logo_url} name="logo_url" onChange={updateUser} />
                </div>
            </div>
        </Card>
    );
};
