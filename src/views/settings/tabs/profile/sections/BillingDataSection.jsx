import React from 'react';
import { Group } from '../../../ui/kit';
import { InputGroup } from '../../../../../components/ui/InputGroup';

export const BillingDataSection = ({ localUser, updateUser }) => {
    return (
        <Group title="Dati di fatturazione" icon="receipt">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Codice SDI (fatt. elettronica)" value={localUser.codice_sdi} name="codice_sdi" onChange={updateUser} />
                <InputGroup label="PEC fatturazione" value={localUser.pec_fatturazione} name="pec_fatturazione" onChange={updateUser} />
                <InputGroup
                    label="Regime fiscale"
                    options={['Ordinario', 'Forfettario', 'Minimi']}
                    value={localUser.regime_fiscale}
                    name="regime_fiscale"
                    onChange={updateUser}
                />
                <InputGroup label="IBAN" value={localUser.iban} name="iban" onChange={updateUser} />
                <InputGroup label="Banca d'appoggio" value={localUser.banca} name="banca" onChange={updateUser} />
                <InputGroup
                    label="Metodi pagamento accettati"
                    placeholder="Contanti, POS, Bonifico"
                    value={localUser.metodi_pagamento}
                    name="metodi_pagamento"
                    onChange={updateUser}
                />
                <div className="col-span-full">
                    <InputGroup label="Note default in fattura (es. esenzione IVA)" value={localUser.note_fattura} name="note_fattura" onChange={updateUser} />
                </div>
            </div>
        </Group>
    );
};
