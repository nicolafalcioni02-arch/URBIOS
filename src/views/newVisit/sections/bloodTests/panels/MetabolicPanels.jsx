import React from 'react';
import { CardCompattabile } from '../../../../../components/ui/Card';

export const MetabolicPanels = ({ renderBloodInput }) => {
    return (
        <>
            <CardCompattabile title="Metabolismo Glicidico" icon="ph-cookie">
                <div className="space-y-3">
                    {renderBloodInput('bg_glicemia')}
                    {renderBloodInput('bg_insulina')}
                    {renderBloodInput('bg_hba1c')}
                    {renderBloodInput('bg_homair')}
                    {renderBloodInput('bg_homabeta')}
                </div>
            </CardCompattabile>

            {/* Pannello Lipidico */}
            <CardCompattabile title="Metabolismo Lipidico" icon="ph-butterfly">
                <div className="space-y-3">
                    {renderBloodInput('bl_col_tot')}
                    {renderBloodInput('bl_hdl')}
                    {renderBloodInput('bl_ldl')}
                    {renderBloodInput('bl_trig')}
                    {renderBloodInput('bl_apob')}
                </div>
            </CardCompattabile>
        </>
    );
};
