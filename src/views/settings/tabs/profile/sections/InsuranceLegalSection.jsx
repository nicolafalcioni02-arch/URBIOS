import React from 'react';
import { Group } from '../../../ui/kit';
import { InputGroup } from '../../../../../components/ui/InputGroup';

export const InsuranceLegalSection = ({ localUser, updateUser }) => (
    <Group title="Assicurazione" icon="shield" hint="Polizza e compagnia finiscono da sole al punto 8 della lettera di incarico.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup label="Numero polizza assicurativa" placeholder="Es. EQ000001880" value={localUser.assicurazione_num} name="assicurazione_num" onChange={updateUser} />
            <InputGroup label="Compagnia assicurativa" placeholder="Es. LLOYD’S / GENERALI" value={localUser.assicurazione_compagnia} name="assicurazione_compagnia" onChange={updateUser} />
        </div>
    </Group>
);
