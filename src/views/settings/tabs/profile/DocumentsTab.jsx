import React from 'react';
import { Page } from '../../ui/kit';
import { ReportTextsSection } from './sections/ReportTextsSection';
import { EngagementLetterSection } from './sections/EngagementLetterSection';
import { useProfile, AUTOSAVE_NOTE } from './useProfile';

export const DocumentsTab = ({ db, onUpdateDb }) => {
    const [user, update] = useProfile(db, onUpdateDb);
    return (
        <Page title="Documenti e privacy" intro={`Testi fissi dei report, lettera di incarico e informativa privacy. ${AUTOSAVE_NOTE}`}>
            <ReportTextsSection localUser={user} updateUser={update} />
            <EngagementLetterSection localUser={user} updateUser={update} />
        </Page>
    );
};
