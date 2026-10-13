import React from 'react';
import { CardCompattabile } from '../../../../../components/ui/Card';

export const HormonalAndInflammatoryPanels = ({ renderBloodInput }) => {
    return (
        <>
            <CardCompattabile title="Profilo Ormonale" icon="ph-crescent-moon">
                <div className="space-y-3">
                    {renderBloodInput('br_testosterone_tot')}
                    {renderBloodInput('br_estradiolo_e2')}
                    {renderBloodInput('br_progesterone')}
                    {renderBloodInput('br_prolattina')}
                    {renderBloodInput('br_adh')}
                    {renderBloodInput('br_lh_luteinizzante')}
                    {renderBloodInput('br_fsh_follicolo')}
                    {renderBloodInput('br_omocisteina')}
                </div>
            </CardCompattabile>

            {/* Pannello Infiammatorio */}
            <CardCompattabile title="Parametri Infiammatori" icon="ph-fire">
                <div className="space-y-3">
                    {renderBloodInput('br_proteina_c_reattiva')}
                    {renderBloodInput('br_ves')}
                    {renderBloodInput('br_procalcitonina')}
                    {renderBloodInput('br_lattato')}
                </div>
            </CardCompattabile>

            {/* Pannello Ferro */}
            <CardCompattabile title="Metabolismo del Ferro" icon="ph-magnet">
                <div className="space-y-3">
                    {renderBloodInput('br_sideremia_ferro')}
                    {renderBloodInput('br_ferritina')}
                    {renderBloodInput('br_transferrina')}
                    {renderBloodInput('br_sat_transferrina')}
                </div>
            </CardCompattabile>

            {/* Pannello Gravidanza e Lattazione */}
            <CardCompattabile title="Gravidanza e Lattazione" icon="ph-baby">
                <div className="space-y-3">
                    {renderBloodInput('br_hcg')}
                    {renderBloodInput('br_estradiolo_e2_gravidanza')}
                    {renderBloodInput('br_progesterone_gravidanza')}
                    {renderBloodInput('br_alpha_fetoproteina')}
                </div>
            </CardCompattabile>

            {/* Pannello Tiroide */}
            <CardCompattabile title="Funzionalità Tiroidea" icon="ph-butterfly">
                <div className="space-y-3">
                    {renderBloodInput('br_tsh')}
                    {renderBloodInput('br_ft3')}
                    {renderBloodInput('br_ft4')}
                    {renderBloodInput('br_antitpo')}
                    {renderBloodInput('br_antitireoglobulina')}
                </div>
            </CardCompattabile>
        </>
    );
};
