import React from 'react';
import { CollapsibleSection, Card } from '../../../components/ui/Card';
import { InputGroup } from '../../../components/ui/InputGroup';
import { ResultBlock } from '../../../components/ui/ResultBlock';

export const SkinfoldsSection = ({
    activeSection,
    calculationContext,
    configA,
    configB,
    formuleConv,
    formulePliche,
    sectionRefs,
    setActiveSection,
    setConfigA,
    setConfigB,
    sommaPliche,
    updateDraft,
    visitDraft,
}) => {
    return (
        <div ref={(el) => (sectionRefs.current['plicometria'] = el)} className="scroll-mt-40">
            <CollapsibleSection
                title="Plicometria"
                isOpen={activeSection === 'plicometria'}
                onToggle={() => setActiveSection(activeSection === 'plicometria' ? null : 'plicometria')}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <Card title="Pliche Superiori" icon="ph-arrow-up">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InputGroup label="Pettorale" unit="mm" name="pl_pettorale" value={visitDraft.pl_pettorale} onChange={updateDraft} />
                            <InputGroup label="Tricipite" unit="mm" name="pl_tricipite" value={visitDraft.pl_tricipite} onChange={updateDraft} />
                            <InputGroup label="Bicipite" unit="mm" name="pl_bicipite" value={visitDraft.pl_bicipite} onChange={updateDraft} />
                            <InputGroup label="Sottoscapolare" unit="mm" name="pl_sottoscap" value={visitDraft.pl_sottoscap} onChange={updateDraft} />
                            <InputGroup label="Ascellare" unit="mm" name="pl_ascellare" value={visitDraft.pl_ascellare} onChange={updateDraft} />
                        </div>
                    </Card>
                    <Card title="Pliche Inferiori" icon="ph-arrow-down">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InputGroup label="Addominale" unit="mm" name="pl_addome" value={visitDraft.pl_addome} onChange={updateDraft} />
                            <InputGroup label="Sovrailiaca" unit="mm" name="pl_sovrailiaca" value={visitDraft.pl_sovrailiaca} onChange={updateDraft} />
                            <InputGroup label="Coscia" unit="mm" name="pl_coscia" value={visitDraft.pl_coscia} onChange={updateDraft} />
                            <InputGroup label="Polpaccio" unit="mm" name="pl_polpaccio" value={visitDraft.pl_polpaccio} onChange={updateDraft} />
                        </div>
                    </Card>
                    <div className="md:col-span-2 rounded-[22px] p-4 sm:p-5 bg-[color:var(--soft)]">
                        <div className="flex justify-between items-end gap-3 mb-5">
                            <div>
                                <h4 className="font-semibold text-[15px] text-[color:var(--ink)]">Risultati</h4>
                                <p className="text-[13px] text-[color:var(--muted)] mt-0.5">Due metodi a confronto</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-medium text-[color:var(--muted)] block">Somma delle pliche</span>
                                <span className="text-3xl font-bold tracking-tight text-[color:var(--ink)]">
                                    {sommaPliche} <small className="text-xs font-medium text-[color:var(--muted)]">mm</small>
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ResultBlock
                                title="Metodo A"
                                config={configA}
                                setConfig={setConfigA}
                                formuleDensita={formulePliche}
                                formuleConversione={formuleConv}
                                calculationContext={calculationContext}
                                accent="blue"
                            />
                            <ResultBlock
                                title="Metodo B"
                                config={configB}
                                setConfig={setConfigB}
                                formuleDensita={formulePliche}
                                formuleConversione={formuleConv}
                                calculationContext={calculationContext}
                                accent="emerald"
                            />
                        </div>
                    </div>
                </div>
            </CollapsibleSection>
        </div>
    );
};
