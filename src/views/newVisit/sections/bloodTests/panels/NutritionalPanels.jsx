import React from 'react';
import { CardCompattabile } from '../../../../../components/ui/Card';

export const NutritionalPanels = ({ renderBloodInput }) => {
    return (
        <>
            <CardCompattabile title="Celiachia" icon="ph-wheat">
                <div className="space-y-3">
                    {renderBloodInput('br_anti_ttg_iga')}
                    {renderBloodInput('br_anti_ttg_igg')}
                    {renderBloodInput('br_anti_ema')}
                </div>
            </CardCompattabile>

            {/* Pannello Vitamine */}
            <CardCompattabile title="Vitamine" icon="ph-sun">
                <div className="space-y-3">
                    {renderBloodInput('br_vitamina_d25oh')}
                    {renderBloodInput('br_vitamina_b12')}
                    {renderBloodInput('br_folat')}
                    {renderBloodInput('br_vitamina_b1')}
                </div>
            </CardCompattabile>

            {/* Pannello Feci */}
            <CardCompattabile title="Esami Feci" icon="ph-toilet">
                <div className="space-y-3">
                    {renderBloodInput('br_calprotectina_fecale')}
                    {renderBloodInput('br_sangue_occulto_feci')}
                </div>
            </CardCompattabile>
        </>
    );
};
