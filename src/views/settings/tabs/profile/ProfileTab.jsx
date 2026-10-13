import React from 'react';
import { Button } from '../../../../components/ui/Button';
import { BillingDataSection } from './sections/BillingDataSection';
import { EngagementLetterSection } from './sections/EngagementLetterSection';
import { InsuranceLegalSection } from './sections/InsuranceLegalSection';
import { OperationalSettingsSection } from './sections/OperationalSettingsSection';
import { PersonalDataSection } from './sections/PersonalDataSection';
import { ProfessionalDataSection } from './sections/ProfessionalDataSection';
import { ReportTextsSection } from './sections/ReportTextsSection';

export const ProfileTab = ({ handleSaveProfile, localUser, tab, updateUser }) => {
    return (
        tab === 'profilo' && (
            <div className="max-w-4xl mx-auto fade-enter space-y-8 pb-20">
                <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                    <div>
                        <h3 className="text-3xl font-[Helvetica] font-bold">Profilo Professionale</h3>
                        {/*<p className="text-gray-500 text-sm">Gestisci tutti i dati che appariranno nei report e nei documenti.</p>*/}
                    </div>
                </div>

                {/* 1. DATI ANAGRAFICI */}
                <PersonalDataSection localUser={localUser} updateUser={updateUser} />

                {/* 2. DATI PROFESSIONALI */}
                <ProfessionalDataSection localUser={localUser} updateUser={updateUser} />

                {/* 3. DATI FATTURAZIONE */}
                <BillingDataSection localUser={localUser} updateUser={updateUser} />

                {/* 4. REPORT E DOCUMENTI */}
                <ReportTextsSection localUser={localUser} updateUser={updateUser} />

                {/* 5. DATI ASSICURATIVI & LEGALI  */}
                <InsuranceLegalSection localUser={localUser} updateUser={updateUser} />

                {/* 6. OPERATIVI */}
                <OperationalSettingsSection localUser={localUser} updateUser={updateUser} />

                {/* 7. CONFIGURAZIONE LETTERA DI INCARICO (Dati per il Generatore PDF) */}
                <EngagementLetterSection localUser={localUser} updateUser={updateUser} />

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveProfile} variant="primary" icon="ph-check-circle" className="bg-black text-white px-8 py-4 text-lg">
                        Salva Tutto
                    </Button>
                </div>
            </div>
        )
    );
};
