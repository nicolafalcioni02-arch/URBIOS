import React from 'react';
import { Card } from '../../../../../components/ui/Card';
import { InputGroup } from '../../../../../components/ui/InputGroup';

export const InsuranceLegalSection = ({ localUser, updateUser }) => {
    return (
        <Card title="5. Dati Assicurativi & Legali" icon="ph-shield-check">
            <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 mb-2">
                    Questi dati verranno inseriti automaticamente nel punto 8 della Lettera di Incarico.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup
                        label="Numero Polizza Assicurativa"
                        placeholder="Es. EQ000001880"
                        value={localUser.assicurazione_num}
                        name="assicurazione_num"
                        onChange={updateUser}
                    />
                    <InputGroup
                        label="Compagnia Assicurativa"
                        placeholder="Es. LLOYD’S / GENERALI"
                        value={localUser.assicurazione_compagnia}
                        name="assicurazione_compagnia"
                        onChange={updateUser}
                    />
                </div>
            </div>
        </Card>
    );
};
