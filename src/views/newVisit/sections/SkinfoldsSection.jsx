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
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
                    <Card title="Pliche Superiori" icon="ph-arrow-up">
                        <div className="space-y-3">
                            <InputGroup label="Pettorale" unit="mm" name="pl_pettorale" value={visitDraft.pl_pettorale} onChange={updateDraft} />
                            <InputGroup label="Tricipite" unit="mm" name="pl_tricipite" value={visitDraft.pl_tricipite} onChange={updateDraft} />
                            <InputGroup label="Bicipite" unit="mm" name="pl_bicipite" value={visitDraft.pl_bicipite} onChange={updateDraft} />
                            <InputGroup label="Sottoscapolare" unit="mm" name="pl_sottoscap" value={visitDraft.pl_sottoscap} onChange={updateDraft} />
                            <InputGroup label="Ascellare" unit="mm" name="pl_ascellare" value={visitDraft.pl_ascellare} onChange={updateDraft} />
                        </div>
                    </Card>
                    <Card title="Pliche Inferiori" icon="ph-arrow-down">
                        <div className="space-y-3">
                            <InputGroup label="Addominale" unit="mm" name="pl_addome" value={visitDraft.pl_addome} onChange={updateDraft} />
                            <InputGroup label="Sovrailiaca" unit="mm" name="pl_sovrailiaca" value={visitDraft.pl_sovrailiaca} onChange={updateDraft} />
                            <InputGroup label="Coscia" unit="mm" name="pl_coscia" value={visitDraft.pl_coscia} onChange={updateDraft} />
                            <InputGroup label="Polpaccio" unit="mm" name="pl_polpaccio" value={visitDraft.pl_polpaccio} onChange={updateDraft} />
                        </div>
                    </Card>
                    <div className="lg:col-span-2 bg-gray-50 rounded-3xl p-5 shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Analisi Comparativa</h4>
                                <p className="text-gray-900 text-2xl mt-1">Risultati Elaborati</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-bold text-gray-500 uppercase block">Somma Pliche Totale</span>
                                <span className="text-3xl font-bold text-gray-900">
                                    {sommaPliche} <small className="text-xs text-blue-600">mm</small>
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
