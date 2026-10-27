import React from 'react';
import { Group } from '../../../ui/kit';
import { TextAreaGroup } from '../../../../../components/ui/InputGroup';

export const ReportTextsSection = ({ localUser, updateUser }) => {
    return (
        <Group title="Testi di report e documenti" icon="document" hint="Compaiono in fondo e in apertura dei documenti stampati.">
            <div className="space-y-4">
                <TextAreaGroup label="Testo footer report (piè di pagina)" rows={2} value={localUser.footer} name="footer" onChange={updateUser} />
                <TextAreaGroup
                    label="Disclaimer medico / legale"
                    placeholder="Es. Il presente piano non sostituisce..."
                    rows={3}
                    value={localUser.disclaimer_report}
                    name="disclaimer_report"
                    onChange={updateUser}
                />
                <TextAreaGroup
                    label="Testo standard relazioni cliniche"
                    placeholder="Intro standard..."
                    rows={3}
                    value={localUser.testo_relazioni}
                    name="testo_relazioni"
                    onChange={updateUser}
                />
            </div>
        </Group>
    );
};
