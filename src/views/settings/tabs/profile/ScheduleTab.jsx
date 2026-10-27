import React from 'react';
import { Page } from '../../ui/kit';
import { OperationalSettingsSection } from './sections/OperationalSettingsSection';
import { useProfile, AUTOSAVE_NOTE } from './useProfile';

export const ScheduleTab = ({ db, onUpdateDb }) => {
    const [user, update] = useProfile(db, onUpdateDb);
    return (
        <Page title="Orari e visite" intro={`Disponibilità, durata delle visite e regole di disdetta. ${AUTOSAVE_NOTE}`}>
            <OperationalSettingsSection localUser={user} updateUser={update} />
        </Page>
    );
};
