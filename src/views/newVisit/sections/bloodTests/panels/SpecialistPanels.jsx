import React from 'react';
import { CardCompattabile } from '../../../../../components/ui/Card';

export const SpecialistPanels = ({ renderBloodInput }) => {
    return (
        <>
            <CardCompattabile title="Cardiologia" icon="ph-heartbeat">
                <div className="space-y-3">
                    {renderBloodInput('br_troponina_i')}
                    {renderBloodInput('br_nt_pro_bnp')}
                    {renderBloodInput('br_ck_mb')}
                </div>
            </CardCompattabile>

            {/* Pannello Marker Tumorali */}
            <CardCompattabile title="Marker Tumorali" icon="ph-dna">
                <div className="space-y-3">
                    {renderBloodInput('br_carcinoembrionario_cec')}
                    {renderBloodInput('br_ca19_9')}
                    {renderBloodInput('br_ca125')}
                    {renderBloodInput('br_afp')}
                    {renderBloodInput('br_psa')}
                </div>
            </CardCompattabile>

            {/* Pannello Epatite e HIV */}
            <CardCompattabile title="Epatite e HIV" icon="ph-shield-warning">
                <div className="space-y-3">
                    {renderBloodInput('br_hbs_ag')}
                    {renderBloodInput('br_hbs_ab')}
                    {renderBloodInput('br_hbe_ag')}
                    {renderBloodInput('br_hbe_ab')}
                    {renderBloodInput('br_hbc_ab')}
                    {renderBloodInput('br_hcv_ab')}
                    {renderBloodInput('br_hiv_1_2_ab')}
                    {renderBloodInput('br_hiv_p24_ag')}
                </div>
            </CardCompattabile>

            {/* Pannello Esame Urine */}
            <CardCompattabile title="Esame delle Urine" icon="ph-drop">
                <div className="space-y-3">
                    {renderBloodInput('urina_ph')}
                    {renderBloodInput('urina_proteine')}
                    {renderBloodInput('urina_glucosio')}
                    {renderBloodInput('urina_cetoni')}
                    {renderBloodInput('urina_sangue')}
                    {renderBloodInput('albumina_urina')}
                    {renderBloodInput('urina_glucosio_proteine')}
                    {renderBloodInput('urina_cetoni_proteine')}
                    {renderBloodInput('urina_sangue_proteine')}
                    {renderBloodInput('corpi_chetonici_sangue')}
                    {renderBloodInput('nitriti_urina')}
                    {renderBloodInput('esterasi_leucocitaria_urina')}
                    {renderBloodInput('salinità_urina')}
                </div>
            </CardCompattabile>
        </>
    );
};
