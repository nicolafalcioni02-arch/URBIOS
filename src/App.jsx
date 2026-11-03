import React, { useCallback, useEffect, useState } from 'react';
import { StartScreen } from './views/start/StartScreen';
import { WelcomeView } from './views/WelcomeView';
import { ProfessionalSuite } from './views/ProfessionalSuite';
import { ModeSelect } from './views/ModeSelect';
import { Lab } from './lab/Lab';
import { ArchiveProvider, useArchive } from './storage/ArchiveProvider';
import { RecoveryCodeModal } from './components/archive/RecoveryCodeModal';
import { ExitDialog } from './components/archive/ExitDialog';
import { ArchiveStatusChip } from './components/archive/ArchiveStatusChip';
import { useKeyboardInset } from './hooks/useKeyboardInset';
import { useLook } from './looks/useLook';

// Il database NON è più salvato in chiaro nel browser: vive in memoria e nel file archivio dell'utente
// (vedi src/storage/). Qui si decide solo quale schermata mostrare.
const AppShell = () => {
    const a = useArchive();
    useKeyboardInset();
    useLook(a.db, a.status === 'open');
    const [welcomeDone, setWelcomeDone] = useState(false);
    const [mode, setMode] = useState(null); // null = scelta area | 'lab' | 'sport'
    const finishWelcome = useCallback(() => setWelcomeDone(true), []);

    useEffect(() => {
        if (a.status !== 'open') { setWelcomeDone(false); setMode(null); }
    }, [a.status]);

    let content = null;
    if (!a.ready) content = <div className="h-screen" style={{ background: "var(--paper)" }} />;
    else if (a.status !== 'open') content = <StartScreen />;
    else if (!welcomeDone) content = <WelcomeView data={a.db} onComplete={finishWelcome} />;
    else if (!mode) content = <ModeSelect data={a.db} onSelect={setMode} onExit={a.openExitDialog} />;
    else if (mode === 'lab')
        content = (
            <div className="h-screen overflow-hidden">
                <Lab db={a.db} onUpdateDb={a.setDb} onBack={() => setMode(null)} />
            </div>
        );
    else
        content = (
            <div className="h-screen overflow-hidden">
                <ProfessionalSuite data={a.db} onUpdateDb={a.setDb} onSwitchArea={() => setMode(null)} />
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
