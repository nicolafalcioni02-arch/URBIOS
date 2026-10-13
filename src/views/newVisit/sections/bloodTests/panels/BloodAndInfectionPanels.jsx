import React from 'react';
import { CardCompattabile } from '../../../../../components/ui/Card';

export const BloodAndInfectionPanels = ({ renderBloodInput }) => {
    return (
        <>
            <CardCompattabile title="Emocromo" icon="ph-test-tube">
                <div className="space-y-3">
                    {renderBloodInput('emoglobina')}
                    {renderBloodInput('hct')}
                    {renderBloodInput('rbc')}
                    {renderBloodInput('wbc')}
                    {renderBloodInput('mcv')}
                    {renderBloodInput('mch')}
                    {renderBloodInput('mchc')}
                    {renderBloodInput('rdw_cv')}
                    {renderBloodInput('rdw_sd')}
                    {renderBloodInput('piastrine')}
                    {renderBloodInput('globuli_bianchi_neutrofili')}
                    {renderBloodInput('globuli_bianchi_linfociti')}
                    {renderBloodInput('globuli_bianchi_monociti')}
                    {renderBloodInput('globuli_bianchi_eosinofili')}
                    {renderBloodInput('globuli_bianchi_basofili')}
                    {renderBloodInput('granulociti_neutrofili_assoluti')}
                    {renderBloodInput('granulociti_linfociti_assoluti')}
                    {renderBloodInput('granulociti_monociti_assoluti')}
                    {renderBloodInput('granulociti_eosinofili_assoluti')}
                    {renderBloodInput('granulociti_basofili_assoluti')}
                </div>
            </CardCompattabile>

            {/* Pannello Batteriemie */}
            <CardCompattabile title="Batteriemie" icon="ph-bug">
                <div className="space-y-3">
                    {renderBloodInput('br_bc_stafilococco_aureo')}
                    {renderBloodInput('br_bc_escherichia_coli')}
                    {renderBloodInput('br_bc_enterococcus_faecalis')}
                    {renderBloodInput('br_bc_pseudomonas_aeruginosa')}
                    {renderBloodInput('br_bc_candida_albicans')}
                </div>
            </CardCompattabile>

            {/* Pannello Diabete Tipo 1 */}
            <CardCompattabile title="Diabete Tipo 1" icon="ph-syringe">
                <div className="space-y-3">
                    {renderBloodInput('br_anti_gad')}
                    {renderBloodInput('br_anti_ia2')}
                    {renderBloodInput('br_anti_insulina')}
                </div>
            </CardCompattabile>

            {/* Pannello Steatosi Epatica & NASH */}
            <CardCompattabile title="Steatosi Epatica (NASH)" icon="ph-liver">
                <div className="space-y-3">
                    {renderBloodInput('br_fibrosis_4_index')}
                    {renderBloodInput('br_nfs_score')}
                    {renderBloodInput('br_ck18_m30')}
                    {renderBloodInput('br_ck18_m65')}
                </div>
            </CardCompattabile>

            {/* Pannello Coagulazione */}
            <CardCompattabile title="Coagulazione" icon="ph-drop">
                <div className="space-y-3">
                    {renderBloodInput('br_pt_protrombina')}
                    {renderBloodInput('br_inr')}
                    {renderBloodInput('br_aptt')}
                </div>
            </CardCompattabile>

            {/* Pannello Prostata */}
            <CardCompattabile title="Prostata" icon="ph-gender-male">
                <div className="space-y-3">
                    {renderBloodInput('br_aps')}
                    {renderBloodInput('br_pca3')}
                    {renderBloodInput('br_Ppsa')}
                    {renderBloodInput('br_psa_libero')}
                    {renderBloodInput('br_rapporto_psa_libero_totale')}
                </div>
            </CardCompattabile>

            {/* Pannello Complesso TORCH */}
            <CardCompattabile title="Complesso TORCH" icon="ph-virus">
                <div className="space-y-3">
                    {renderBloodInput('br_toxoplasma_igg')}
                    {renderBloodInput('br_toxoplasma_igm')}
                    {renderBloodInput('br_cmv_igg')}
                    {renderBloodInput('br_cmv_igm')}
                    {renderBloodInput('br_rubeola_igg')}
                    {renderBloodInput('br_rubeola_igm')}
                    {renderBloodInput('br_herpes_igg')}
                    {renderBloodInput('br_herpes_igm')}
                </div>
            </CardCompattabile>
        </>
    );
};
