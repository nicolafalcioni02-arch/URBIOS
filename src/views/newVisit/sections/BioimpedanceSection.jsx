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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-6">
                        <Card title="Dati Bioelettrici" icon="ph-lightning-slash">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <InputGroup label="Rz (Resistenza)" placeholder="Ohm" name="biva_rz" value={rawRz || ''} onChange={updateDraft} />
                                <InputGroup label="Xc (Reattanza)" placeholder="Ohm" name="biva_xc" value={rawXc || ''} onChange={updateDraft} />
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <span className="text-xs font-bold text-gray-500 uppercase">Angolo di Fase</span>
                                <span className="text-2xl font-bold ">{monoPhA ? monoPhA.toFixed(1) + '°' : '--'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="text-[10px] text-gray-400 font-bold block">Rz/H</span>
                                    <span className="text-lg font-bold">{rzH}</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="text-[10px] text-gray-400 font-bold block">Xc/H</span>
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
