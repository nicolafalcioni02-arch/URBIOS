import React from 'react';
import { Group } from '../../../ui/kit';
import { TextAreaGroup, InputGroup } from '../../../../../components/ui/InputGroup';

export const OperationalSettingsSection = ({ localUser, updateUser }) => {
    return (
        <Group title="Orari e visite" icon="clock">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full">
                    <TextAreaGroup
                        label="Disponibilità oraria"
                        placeholder="Lun-Ven: 9:00 - 18:00"
                        rows={2}
                        value={localUser.orari_studio}
                        name="orari_studio"
                        onChange={updateUser}
                    />
                </div>
                <InputGroup
                    label="Durata standard prima visita (min)"
                    type="number"
                    value={localUser.durata_prima_visita}
                    name="durata_prima_visita"
                    onChange={updateUser}
                />
                <InputGroup
                    label="Durata standard controllo (min)"
                    type="number"
                    value={localUser.durata_controllo}
                    name="durata_controllo"
                    onChange={updateUser}
                />
                <div className="col-span-full">
                    <TextAreaGroup
                        label="Politiche di cancellazione"
                        placeholder="Disdetta entro 24h..."
                        rows={2}
                        value={localUser.policy_cancellazione}
                        name="policy_cancellazione"
                        onChange={updateUser}
                    />
                </div>
            </div>
        </Group>
    );
};
