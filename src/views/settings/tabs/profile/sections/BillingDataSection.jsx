import React from 'react';
import { Card } from '../../../../../components/ui/Card';
import { InputGroup } from '../../../../../components/ui/InputGroup';

export const BillingDataSection = ({ localUser, updateUser }) => {
    return (
        <Card title="3. Dati Fatturazione" icon="ph-currency-eur">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Codice SDI (Fatt. Elettronica)" value={localUser.codice_sdi} name="codice_sdi" onChange={updateUser} />
                <InputGroup label="PEC Fatturazione" value={localUser.pec_fatturazione} name="pec_fatturazione" onChange={updateUser} />
                <InputGroup
                    label="Regime Fiscale"
                    options={['Ordinario', 'Forfettario', 'Minimi']}
                    value={localUser.regime_fiscale}
                    name="regime_fiscale"
                    onChange={updateUser}
                />
                <InputGroup label="IBAN" value={localUser.iban} name="iban" onChange={updateUser} />
                <InputGroup label="Banca d'appoggio" value={localUser.banca} name="banca" onChange={updateUser} />
                <InputGroup
                    label="Metodi Pagamento Accettati"
                    placeholder="Contanti, POS, Bonifico"
                    value={localUser.metodi_pagamento}
                    name="metodi_pagamento"
                    onChange={updateUser}
                />
                <div className="col-span-full">
                    <InputGroup label="Note Default in Fattura (es. Esenzione IVA)" value={localUser.note_fattura} name="note_fattura" onChange={updateUser} />
                </div>
            </div>
        </Card>
    );
};
