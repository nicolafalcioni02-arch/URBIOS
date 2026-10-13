import React from 'react';
import { CardCompattabile } from '../../../../../components/ui/Card';

export const OrganFunctionPanels = ({ renderBloodInput }) => {
    return (
        <>
            <CardCompattabile title="Funzionalità Renale" icon="ph-kidney">
                <div className="space-y-3">
                    {renderBloodInput('br_crea')}
                    {renderBloodInput('br_egfr')}
                    {renderBloodInput('br_urea')}
                    {renderBloodInput('br_urico')}
                    {renderBloodInput('br_microalb')}
                </div>
            </CardCompattabile>

            {/* Pannello Epatico */}
            <CardCompattabile title="Funzionalità Epatica" icon="ph-liver">
                <div className="space-y-3">
                    {renderBloodInput('br_ast')}
                    {renderBloodInput('br_alt')}
                    {renderBloodInput('br_gamma_gt')}
                    {renderBloodInput('br_alb')}
                    {renderBloodInput('br_bilirubina_totale')}
                </div>
            </CardCompattabile>

            {/* Pannello Elettroliti */}
            <CardCompattabile title="Elettroliti" icon="ph-lightning">
                <div className="space-y-3">
                    {renderBloodInput('br_cloro')}
                    {renderBloodInput('br_fosforo')}
                    {renderBloodInput('br_magnesio')}
                    {renderBloodInput('br_sodio')}
                    {renderBloodInput('br_potassio')}
                    {renderBloodInput('br_calcio')}
                    {renderBloodInput('br_bicarbonati')}
                </div>
            </CardCompattabile>
        </>
    );
};
