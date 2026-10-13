import React from 'react';
import { CollapsibleSection } from '../../../../components/ui/Card';
import { BloodAndInfectionPanels } from './panels/BloodAndInfectionPanels';
import { HormonalAndInflammatoryPanels } from './panels/HormonalAndInflammatoryPanels';
import { MetabolicPanels } from './panels/MetabolicPanels';
import { NutritionalPanels } from './panels/NutritionalPanels';
import { OrganFunctionPanels } from './panels/OrganFunctionPanels';
import { SpecialistPanels } from './panels/SpecialistPanels';

export const BloodTestsSection = ({ activeSection, renderBloodInput, sectionRefs, setActiveSection }) => {
    return (
        <div ref={(el) => (sectionRefs.current['ematochimico'] = el)}>
            <CollapsibleSection
                title="Profilo Ematochimico"
                isOpen={activeSection === 'ematochimico'}
                onToggle={() => setActiveSection(activeSection === 'ematochimico' ? null : 'ematochimico')}
            >
                {/* Mantieni la TUA griglia originale */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Pannello Glucidico */}
                    <MetabolicPanels renderBloodInput={renderBloodInput} />

                    {/* Pannello Renale */}
                    <OrganFunctionPanels renderBloodInput={renderBloodInput} />

                    {/* Pannello Ormonale */}
                    <HormonalAndInflammatoryPanels renderBloodInput={renderBloodInput} />

                    {/* Pannello Celiachia */}
                    <NutritionalPanels renderBloodInput={renderBloodInput} />

                    {/* Pannello Emocromocitometrico */}
                    <BloodAndInfectionPanels renderBloodInput={renderBloodInput} />

                    {/* Pannello Cardiologia */}
                    <SpecialistPanels renderBloodInput={renderBloodInput} />
                </div>{' '}
                {/* <--- IL DIV SI CHIUDE QUI, DENTRO LA SECTION */}
            </CollapsibleSection>
        </div>
    );
};
