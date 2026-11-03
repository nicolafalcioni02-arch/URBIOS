import React from 'react';
import { Group } from '../../../ui/kit';
import { InputGroup } from '../../../../../components/ui/InputGroup';

// Valori proposti a ogni nuova fattura (db.utente.fatt_*). Le fatture già emesse non cambiano.
export const InvoiceDefaultsSection = ({ localUser, updateUser }) => (
    <Group title="Nuove fatture" icon="receipt" hint="Il listino proposto quando emetti una fattura: prima visita, controllo, piani. Puoi sempre cambiare prezzo e voci in fattura. Quelle già emesse restano com'erano.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup label="Prima visita (€)" placeholder="80" value={localUser.fatt_prezzo_prima} name="fatt_prezzo_prima" onChange={updateUser} />
            <InputGroup label="Visita di controllo (€)" placeholder="50" value={localUser.fatt_prezzo_controllo} name="fatt_prezzo_controllo" onChange={updateUser} />
            <InputGroup label="Piano alimentare (€)" value={localUser.fatt_prezzo_dieta} name="fatt_prezzo_dieta" onChange={updateUser} />
            <InputGroup label="Piano di allenamento (€)" value={localUser.fatt_prezzo_training} name="fatt_prezzo_training" onChange={updateUser} />
            <InputGroup label="Altre prestazioni (€)" value={localUser.fatt_tariffa} name="fatt_tariffa" onChange={updateUser} />
            <InputGroup label="Prefisso numero (es. FA-)" value={localUser.fatt_prefisso} name="fatt_prefisso" onChange={updateUser} />
            <InputGroup label="IVA predefinita (%)" placeholder="22, oppure 0 se esente" value={localUser.fatt_iva} name="fatt_iva" onChange={updateUser} />
            <InputGroup label="Rivalsa / cassa previdenza (%)" placeholder="0" value={localUser.fatt_rivalsa} name="fatt_rivalsa" onChange={updateUser} />
        </div>
    </Group>
);
