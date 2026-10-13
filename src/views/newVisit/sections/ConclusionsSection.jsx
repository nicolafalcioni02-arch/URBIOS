import React from 'react';
import { Card } from '../../../components/ui/Card';
import { TextAreaGroup } from '../../../components/ui/InputGroup';

export const ConclusionsSection = ({ sectionRefs, updateDraft, visitDraft }) => {
    return (
        <div ref={(el) => (sectionRefs.current['conclusioni'] = el)} className="scroll-mt-40">
            <Card title="Valutazione professionale" icon="ph-signature" className="col-span-full">
                <p className="text-[13px] text-[color:var(--muted)] mb-3">Questo testo compare nel report che consegni al paziente.</p>
                <TextAreaGroup
                    label=""
                    placeholder="Scrivi qui la tua valutazione"
                    name="valutazione_report"
                    value={visitDraft.valutazione_report}
                    onChange={updateDraft}
                    rows={8}
                />
            </Card>
        </div>
    );
};
