import React from 'react';
import { CollapsibleSection, Card } from '../../../components/ui/Card';
import { InputGroup, BilateralInput } from '../../../components/ui/InputGroup';

export const AnthropometrySection = ({ activeSection, sectionRefs, setActiveSection, updateDraft, visitDraft }) => {
    return (
        <div ref={(el) => (sectionRefs.current['antropometria'] = el)} className="scroll-mt-40">
            <CollapsibleSection
                title="Antropometria"
                isOpen={activeSection === 'antropometria'}
                onToggle={() => setActiveSection(activeSection === 'antropometria' ? null : 'antropometria')}
            >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    <Card title="Ponderale & Tronco" icon="ph-scales">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <InputGroup label="Peso" placeholder="0.0" unit="kg" name="peso" value={visitDraft.peso} onChange={updateDraft} />
                            <InputGroup label="Altezza" placeholder="0" unit="cm" name="altezza" value={visitDraft.altezza} onChange={updateDraft} />
                        </div>
                        <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-3">
                            <InputGroup label="Collo" unit="cm" name="cm_collo" value={visitDraft.cm_collo} onChange={updateDraft} />
                            <InputGroup label="Torace" unit="cm" name="cm_torace" value={visitDraft.cm_torace} onChange={updateDraft} />
                            <InputGroup label="Vita (Min)" unit="cm" name="cm_vita_min" value={visitDraft.cm_vita_min} onChange={updateDraft} />
                            <InputGroup label="Fianchi (Max)" unit="cm" name="cm_fianchi_max" value={visitDraft.cm_fianchi_max} onChange={updateDraft} />
                        </div>
                    </Card>
                    <Card title="Diametri Ossei (mm)" icon="ph-bone">
                        <div className="grid grid-cols-2 gap-3">
                            <InputGroup label="Omero" unit="mm" name="dm_omero" value={visitDraft.dm_omero} onChange={updateDraft} />
                            <InputGroup label="Femore" unit="mm" name="dm_femore" value={visitDraft.dm_femore} onChange={updateDraft} />
                            <InputGroup label="Polso" unit="mm" name="dm_polso" value={visitDraft.dm_polso} onChange={updateDraft} />
                            <InputGroup label="Biacromiale" unit="mm" name="dm_biacrom" value={visitDraft.dm_biacrom} onChange={updateDraft} />
                            <InputGroup label="Bi-Iliaco" unit="mm" name="dm_biiliaco" value={visitDraft.dm_biiliaco} onChange={updateDraft} />
                            <InputGroup label="Trasv. Torace" unit="mm" name="dm_torace_trasv" value={visitDraft.dm_torace_trasv} onChange={updateDraft} />
                        </div>
                    </Card>
                    <Card title="Lunghezze Segmentali" icon="ph-ruler">
                        <div className="grid grid-cols-2 gap-3">
                            <InputGroup label="Alt. Seduto" unit="cm" name="len_seduto" value={visitDraft.len_seduto} onChange={updateDraft} />
                            <InputGroup label="Span Braccia" unit="cm" name="len_span" value={visitDraft.len_span} onChange={updateDraft} />
                            <InputGroup label="Lungh. Braccio" unit="cm" name="len_braccio" value={visitDraft.len_braccio} onChange={updateDraft} />
                            <InputGroup label="Lungh. Avambr." unit="cm" name="len_avambr" value={visitDraft.len_avambr} onChange={updateDraft} />
                            <InputGroup label="Lungh. Coscia" unit="cm" name="len_coscia" value={visitDraft.len_coscia} onChange={updateDraft} />
                            <InputGroup label="Lungh. Gamba" unit="cm" name="len_gamba" value={visitDraft.len_gamba} onChange={updateDraft} />
                        </div>
                    </Card>
                    <Card title="Arti Bilaterali (Circonferenze)" icon="ph-arrows-left-right">
                        <div className="space-y-1">
                            <BilateralInput label="Braccio" name="circ_braccio" value={visitDraft.circ_braccio} onChange={updateDraft} />
                            <BilateralInput label="Avambraccio" name="circ_avambr" value={visitDraft.circ_avambr} onChange={updateDraft} />
                            <BilateralInput label="Polso" name="circ_polso" value={visitDraft.circ_polso} onChange={updateDraft} />
                            <BilateralInput label="Coscia" name="circ_coscia" value={visitDraft.circ_coscia} onChange={updateDraft} />
                            <BilateralInput label="Polpaccio" name="circ_polpaccio" value={visitDraft.circ_polpaccio} onChange={updateDraft} />
                            <BilateralInput label="Caviglia" name="circ_caviglia" value={visitDraft.circ_caviglia} onChange={updateDraft} />
                        </div>
                    </Card>
                </div>
            </CollapsibleSection>
        </div>
    );
};
