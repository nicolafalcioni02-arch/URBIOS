import React from 'react';
import { Page } from '../../ui/kit';
import { PersonalDataSection } from './sections/PersonalDataSection';
import { ProfessionalDataSection } from './sections/ProfessionalDataSection';
import { useProfile, AUTOSAVE_NOTE } from './useProfile';

export const ProfileTab = ({ db, onUpdateDb }) => {
    const [user, update] = useProfile(db, onUpdateDb);
    return (
        <Page title="Profilo" intro={`I tuoi dati compaiono nei report e nei documenti. ${AUTOSAVE_NOTE}`}>
            <PersonalDataSection localUser={user} updateUser={update} />
            <ProfessionalDataSection localUser={user} updateUser={update} />
        </Page>
    );
};
