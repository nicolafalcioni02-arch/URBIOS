import React from 'react';
import { Card } from '../../../components/ui/Card';
import { TextAreaGroup } from '../../../components/ui/InputGroup';

export const ConclusionsSection = ({ sectionRefs, updateDraft, visitDraft }) => {
    return (
        <div ref={(el) => (sectionRefs.current['conclusioni'] = el)} className="scroll-mt-40">
            <Card title="Valutazione Professionale & Conclusioni" icon="ph-signature" className="col-span-full">
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-[10px] text-emerald-600 font-bold uppercase mb-2">Testo visibile nel Report Finale</p>
                    <TextAreaGroup
                        label=""
                        placeholder="Scrivi qui la tua valutazione professionale completa..."
                        name="valutazione_report"
                        value={visitDraft.valutazione_report}
                        onChange={updateDraft}
                        rows={6}
                    />
                </div>
            </Card>
        </div>
    );
};
