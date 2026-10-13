import React from 'react';
import { Card } from '../../../../../components/ui/Card';
import { TextAreaGroup, InputGroup } from '../../../../../components/ui/InputGroup';

export const OperationalSettingsSection = ({ localUser, updateUser }) => {
    return (
        <Card title="6. Impostazioni Operative" icon="ph-clock">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full">
                    <TextAreaGroup
                        label="Disponibilità Oraria"
                        placeholder="Lun-Ven: 9:00 - 18:00"
                        rows={2}
                        value={localUser.orari_studio}
                        name="orari_studio"
                        onChange={updateUser}
                    />
                </div>
                <InputGroup
                    label="Durata Standard Prima Visita (min)"
                    type="number"
                    value={localUser.durata_prima_visita}
                    name="durata_prima_visita"
                    onChange={updateUser}
                />
                <InputGroup
                    label="Durata Standard Controllo (min)"
                    type="number"
                    value={localUser.durata_controllo}
                    name="durata_controllo"
                    onChange={updateUser}
                />
                <div className="col-span-full">
                    <TextAreaGroup
                        label="Politiche di Cancellazione"
                        placeholder="Disdetta entro 24h..."
                        rows={2}
                        value={localUser.policy_cancellazione}
                        name="policy_cancellazione"
                        onChange={updateUser}
                    />
                </div>
            </div>
        </Card>
    );
};
