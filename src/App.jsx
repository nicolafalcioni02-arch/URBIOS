import React, { useCallback, useEffect, useState } from 'react';
import { StartScreen } from './views/start/StartScreen';
import { WelcomeView } from './views/WelcomeView';
import { ProfessionalSuite } from './views/ProfessionalSuite';
import { ArchiveProvider, useArchive } from './storage/ArchiveProvider';
import { RecoveryCodeModal } from './components/archive/RecoveryCodeModal';
import { ExitDialog } from './components/archive/ExitDialog';
import { ArchiveStatusChip } from './components/archive/ArchiveStatusChip';
import { useKeyboardInset } from './hooks/useKeyboardInset';

// Il database NON è più salvato in chiaro nel browser: vive in memoria e nel file archivio dell'utente
// (vedi src/storage/). Qui si decide solo quale schermata mostrare.
const AppShell = () => {
    const a = useArchive();
    useKeyboardInset();
    const [welcomeDone, setWelcomeDone] = useState(false);
    const finishWelcome = useCallback(() => setWelcomeDone(true), []);

    useEffect(() => {
        if (a.status !== 'open') setWelcomeDone(false);
    }, [a.status]);

    let content = null;
    if (!a.ready) content = <div className="h-screen" style={{ background: "var(--paper)" }} />;
    else if (a.status !== 'open') content = <StartScreen />;
    else if (!welcomeDone) content = <WelcomeView data={a.db} onComplete={finishWelcome} />;
    else
        content = (
            <div className="h-screen overflow-hidden">
                <ProfessionalSuite data={a.db} onUpdateDb={a.setDb} />
            </div>
        );

    return (
        <>
            {content}
            {a.pendingRecoveryCode && <RecoveryCodeModal code={a.pendingRecoveryCode} onConfirm={a.acknowledgeRecoveryCode} />}
            {a.exitDialogOpen && a.status === 'open' && <ExitDialog />}
            {a.status === 'open' && welcomeDone && <ArchiveStatusChip />}
        </>
    );
};

const App = () => (
    <ArchiveProvider>
        <AppShell />
    </ArchiveProvider>
);

export default App;
