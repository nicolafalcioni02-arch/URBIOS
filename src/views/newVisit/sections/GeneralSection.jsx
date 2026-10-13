import React from 'react';
import { CollapsibleSection, Card } from '../../../components/ui/Card';
import { InputGroup, TextAreaGroup } from '../../../components/ui/InputGroup';

export const GeneralSection = ({ activeSection, sectionRefs, setActiveSection, updateDraft, visitDraft }) => {
    return (
        <div ref={(el) => (sectionRefs.current['generale'] = el)} className="scroll-mt-40">
            <CollapsibleSection
                title="Generale"
                isOpen={activeSection === 'generale'}
                onToggle={() => setActiveSection(activeSection === 'generale' ? null : 'generale')}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card title="Benessere & Funzioni" icon="ph-brain">
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Ore Sonno" type="number" name="ore_sonno" value={visitDraft.ore_sonno} onChange={updateDraft} />
                            <InputGroup
                                label="Livello Stress"
                                options={['Basso', 'Medio', 'Alto']}
                                name="stress"
                                value={visitDraft.stress}
                                onChange={updateDraft}
                            />
                            <InputGroup label="Alvo" name="alvo" value={visitDraft.alvo} onChange={updateDraft} />
                            <InputGroup label="Diuresi" name="diuresi" value={visitDraft.diuresi} onChange={updateDraft} />
                        </div>
                    </Card>
                    <Card title="Metabolismo & Cardio" icon="ph-fire">
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="PA Max" unit="mmHg" name="pa_max" value={visitDraft.pa_max} onChange={updateDraft} />
                            <InputGroup label="PA Min" unit="mmHg" name="pa_min" value={visitDraft.pa_min} onChange={updateDraft} />
                            <InputGroup label="HR" unit="bpm" name="hr" value={visitDraft.hr} onChange={updateDraft} />
                            <InputGroup label="SpO2" unit="%" name="spo2" value={visitDraft.spo2} onChange={updateDraft} />
                        </div>
                    </Card>
                    <Card title="Attività Fisica" icon="ph-person-run" className="col-span-full">
                        <TextAreaGroup label="Descrizione Attività" name="Attivita_Fisica" value={visitDraft.Attivita_Fisica} onChange={updateDraft} />
                    </Card>
                </div>
            </CollapsibleSection>
        </div>
    );
};
