import React from 'react';
import { CollapsibleSection, Card } from '../../../components/ui/Card';
import { InputGroup, TextAreaGroup } from '../../../components/ui/InputGroup';
import { BivaChart } from '../../../components/charts/BivaChart';

export const BioimpedanceSection = ({ activeSection, monoPhA, rawRz, rawXc, rzH, sectionRefs, setActiveSection, updateDraft, visitDraft, xcH }) => {
    return (
        <div ref={(el) => (sectionRefs.current['bioimpedenza'] = el)} className="scroll-mt-40">
            <CollapsibleSection
                title="Bioimpedenziometria"
                isOpen={activeSection === 'bioimpedenza'}
                onToggle={() => setActiveSection(activeSection === 'bioimpedenza' ? null : 'bioimpedenza')}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
                    <div className="space-y-6">
                        <Card title="Dati bioelettrici" icon="ph-lightning-slash">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <InputGroup label="Rz (Resistenza)" placeholder="Ohm" name="biva_rz" value={rawRz || ''} onChange={updateDraft} />
                                <InputGroup label="Xc (Reattanza)" placeholder="Ohm" name="biva_xc" value={rawXc || ''} onChange={updateDraft} />
                            </div>
                            <div className="flex justify-between items-center rounded-xl p-4 bg-[color:var(--soft)]">
                                <span className="text-sm font-medium text-[color:var(--muted)]">Angolo di fase</span>
                                <span className="text-3xl font-bold tracking-tight">{monoPhA ? monoPhA.toFixed(1) + '°' : '--'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="rounded-xl p-3 bg-[color:var(--soft)]">
                                    <span className="text-xs text-[color:var(--muted)] font-medium block">Rz/H</span>
                                    <span className="text-lg font-bold">{rzH}</span>
                                </div>
                                <div className="rounded-xl p-3 bg-[color:var(--soft)]">
                                    <span className="text-xs text-[color:var(--muted)] font-medium block">Xc/H</span>
                                    <span className="text-lg font-bold">{xcH}</span>
                                </div>
                            </div>
                        </Card>
                        <Card title="Note BIVA" icon="ph-note-pencil">
                            <TextAreaGroup
                                label="Note:"
                                placeholder="Osservazioni..."
                                name="note_biva"
                                value={visitDraft.note_biva || ''}
                                onChange={updateDraft}
                                rows={4}
                            />
                        </Card>
                    </div>
                    <div className="h-full min-h-[500px]">
                        <BivaChart rz={visitDraft.biva_rz} xc={visitDraft.biva_xc} h={visitDraft.altezza} />
                    </div>
                </div>
            </CollapsibleSection>
        </div>
    );
};
