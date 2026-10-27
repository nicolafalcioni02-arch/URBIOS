import React from 'react';
import { Page } from '../../ui/kit';
import { BillingDataSection } from './sections/BillingDataSection';
import { InsuranceLegalSection } from './sections/InsuranceLegalSection';
import { useProfile, AUTOSAVE_NOTE } from './useProfile';

export const BillingTab = ({ db, onUpdateDb }) => {
    const [user, update] = useProfile(db, onUpdateDb);
    return (
        <Page title="Fatturazione" intro={`Dati fiscali, pagamenti e assicurazione professionale. ${AUTOSAVE_NOTE}`}>
            <BillingDataSection localUser={user} updateUser={update} />
            <InsuranceLegalSection localUser={user} updateUser={update} />
        </Page>
    );
};
