import React from 'react';
import { Card } from '../../../../../components/ui/Card';
import { TextAreaGroup } from '../../../../../components/ui/InputGroup';

export const ReportTextsSection = ({ localUser, updateUser }) => {
    return (
        <Card title="4. Testi per Report & Documenti" icon="ph-file-text">
            <div className="space-y-4">
                <TextAreaGroup label="Testo Footer Report (Piè di pagina)" rows={2} value={localUser.footer} name="footer" onChange={updateUser} />
                <TextAreaGroup
                    label="Disclaimer Medico / Legale"
                    placeholder="Es. Il presente piano non sostituisce..."
                    rows={3}
                    value={localUser.disclaimer_report}
                    name="disclaimer_report"
                    onChange={updateUser}
                />
                <TextAreaGroup
                    label="Testo Standard Relazioni Cliniche"
                    placeholder="Intro standard..."
                    rows={3}
                    value={localUser.testo_relazioni}
                    name="testo_relazioni"
                    onChange={updateUser}
                />
            </div>
        </Card>
    );
};
