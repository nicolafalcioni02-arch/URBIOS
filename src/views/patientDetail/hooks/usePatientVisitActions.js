import { calculateEquation } from '../../../logic/calculations';

// Bozza visita: aggiornamento campi, anagrafica paziente, salvataggio visita (handleFinalizeVisit)
export const usePatientVisitActions = ({ configA, configB, db, onUpdateDb, patient, setView, setVisitDraft, visitDraft }) => {
    const updateDraft = (field, value) => {
        setVisitDraft((prev) => ({ ...prev, [field]: value }));
    };

    const updatePatientInfo = (field, value) => {
        onUpdateDb((prevDb) => {
            const updated = prevDb.pazienti.map((p) => (p.id === patient.id ? { ...p, [field]: value } : p));
            return { ...prevDb, pazienti: updated };
        });
    };

    // --- 3. SALVATAGGIO CON CALCOLI PROTETTI ---
    const handleFinalizeVisit = () => {
        console.log('Tentativo di salvataggio visita...'); // DEBUG

        // 1. Validazione base
        if (!visitDraft.peso) {
            alert('Devi inserire almeno il PESO per salvare la visita!');
            return;
        }

        try {
            // A. Contesto
            const oggi = new Date();
            const nascita = new Date(patient.dataNascita || oggi);
            let eta = oggi.getFullYear() - nascita.getFullYear();
            if (oggi.getMonth() < nascita.getMonth() || (oggi.getMonth() === nascita.getMonth() && oggi.getDate() < nascita.getDate())) eta--;

            const calculationContext = {
                sesso: (patient.sesso || 'M').toUpperCase(),
                eta: eta,
            };

            // Pulizia dati numerici
            Object.keys(visitDraft).forEach((k) => {
                // Sostituisce virgole con punti e gestisce stringhe vuote
                const valStr = String(visitDraft[k]).replace(',', '.');
                calculationContext[k] = valStr === '' ? 0 : parseFloat(valStr) || 0;
            });

            // Somma delle pliche e suo logaritmo: servono alle formule di densita' (stesso calcolo della schermata Nuova Visita)
            const plicheKeys = ['pl_pettorale', 'pl_tricipite', 'pl_bicipite', 'pl_sottoscap', 'pl_ascellare', 'pl_addome', 'pl_sovrailiaca', 'pl_coscia', 'pl_polpaccio'];
            const sommaPliche = plicheKeys.reduce((acc, k) => acc + (calculationContext[k] || 0), 0);
            calculationContext.sommaPliche = sommaPliche;
            calculationContext.logSomma = sommaPliche > 0 ? Math.log10(sommaPliche) : 0;

            // B. Helper Calcolo
            const calcola = (cfg) => {
                // Protezione contro database non caricati
                if (!db.formule) return { error: 'Database formule mancante' };

                const fDens = db.formule.find((f) => f.id === Number(cfg.densId));
                const fConv = db.formule.find((f) => f.id === Number(cfg.convId));

                let dcVal = 0;
                let fmVal = 0;

                // Eseguiamo i calcoli solo se abbiamo le formule e la funzione calculateEquation esiste
                try {
                    if (fDens && sommaPliche > 0 && typeof calculateEquation === 'function') {
                        dcVal = calculateEquation(fDens.equazione, calculationContext);
                    }

                    const ctxConDc = { ...calculationContext, dc: dcVal };

                    if (fDens && fConv && dcVal !== null && typeof calculateEquation === 'function') {
                        fmVal = calculateEquation(fConv.equazione, ctxConDc);
                    }
                } catch (err) {
                    console.error('Errore nel calcolo formula:', err);
                    // Non blocchiamo tutto, restituiamo valori vuoti
                }

                const peso = calculationContext.peso || 0;

                // FORMATTAZIONE SOLO PER IL SALVATAGGIO (Output Stringhe)
                return {
                    formula_densita: fDens?.titolo || 'N/A',
                    formula_conv: fConv?.titolo || 'N/A',
                    densita: dcVal && dcVal !== 0 ? Number(dcVal).toFixed(4) : '--',
                    fm_percent: fmVal && fmVal !== 0 ? Number(fmVal).toFixed(2) : '--',
                    fm_kg: fmVal && peso > 0 ? ((peso * fmVal) / 100).toFixed(2) : '--',
                    ffm_kg: fmVal && peso > 0 ? (peso - (peso * fmVal) / 100).toFixed(2) : '--',
                };
            };

            const risultatiA = calcola(configA);
            const risultatiB = calcola(configB);

            const newVisit = {
                id: Date.now(),
                data: new Date().toLocaleDateString('en-CA'),
                peso: parseFloat(visitDraft.peso),
                dietStatus: 'todo',
                note: visitDraft.note || 'Nessuna nota principale',
                dettagli: {
                    ...visitDraft,
                    risultati_metodo_A: risultatiA,
                    risultati_metodo_B: risultatiB,
                },
            };

            console.log('Oggetto visita creato:', newVisit); // DEBUG

            onUpdateDb((prev) => {
                const updatedPatients = prev.pazienti.map((p) =>
                    p.id === patient.id
                        ? { ...p, visite: [newVisit, ...p.visite] } // Aggiunge in cima
                        : p
                );
                return { ...prev, pazienti: updatedPatients };
            });

            alert('Visita salvata con successo!');
            setView('history');

            // Reset pulito
            setVisitDraft((prev) => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: '' }), {}));
        } catch (error) {
            console.error('ERRORE FATALE DURANTE IL SALVATAGGIO:', error);
            alert('Si è verificato un errore durante il salvataggio. Controlla la console (F12) per i dettagli.');
        }
    };

    return { updateDraft, updatePatientInfo, handleFinalizeVisit };
};
