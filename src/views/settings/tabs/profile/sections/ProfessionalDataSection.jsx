import React from 'react';
import { Group } from '../../../ui/kit';
import { InputGroup } from '../../../../../components/ui/InputGroup';

export const ProfessionalDataSection = ({ localUser, updateUser }) => {
    return (
        <Group title="Dati professionali" icon="building">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full">
                    <InputGroup
                        label="Qualifica / titolo (es. dottore, biologo...)"
                        placeholder="Es. Dott. Mario Rossi, Biologo Nutrizionista"
                        value={localUser.titolo_professionale}
                        name="titolo_professionale"
                        onChange={updateUser}
                    />
                </div>
                <InputGroup
                    label="Ordine di appartenenza"
                    placeholder="Es. Ordine Nazionale Biologi"
                    value={localUser.ordine_appartenenza}
                    name="ordine_appartenenza"
                    onChange={updateUser}
                />
                <InputGroup label="Numero iscrizione albo" value={localUser.numero_albo} name="numero_albo" onChange={updateUser} />
                <div className="col-span-full">
                    <InputGroup
                        label="Specializzazioni / master"
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
                        label="Indirizzo studio principale"
                        placeholder="Via Roma 1, Milano"
                        value={localUser.indirizzo_studio}
                        name="indirizzo_studio"
                        onChange={updateUser}
                    />
                </div>
                <div className="col-span-full">
                    <InputGroup
                        label="Eventuali sedi multiple"
                        placeholder="Sede 2: Via..."
                        value={localUser.sedi_multiple}
                        name="sedi_multiple"
                        onChange={updateUser}
                    />
                </div>
                <div className="col-span-full">
                    <InputGroup label="URL logo studio" placeholder="https://..." value={localUser.logo_url} name="logo_url" onChange={updateUser} />
                </div>
            </div>
        </Group>
    );
};
