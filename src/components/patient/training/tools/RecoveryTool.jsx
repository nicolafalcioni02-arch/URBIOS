import React, { useState } from 'react';
import { Card, Field, Result } from './ui';
import { hooper } from '../logic/science/heartRate';

const Q = [
    ['sonno', 'Qualità del sonno', '1 = ottima · 7 = pessima'],
    ['stress', 'Stress', '1 = nessuno · 7 = altissimo'],
    ['fatica', 'Fatica', '1 = nessuna · 7 = estrema'],
    ['dolori', 'Dolori muscolari (DOMS)', '1 = nessuno · 7 = fortissimi'],
];

export const RecoveryTool = () => {
    const [v, setV] = useState({ sonno: '', stress: '', fatica: '', dolori: '' });
    const h = hooper(v);
    return (
        <div>
            <Card
                title="Indice di Hooper (prontezza al mattino)"
                hint="Questionario di 4 voci (1-7) da far compilare al cliente prima dell'allenamento. Più il totale è alto, peggio sta. Conta il CONFRONTO con i suoi valori abituali: usalo per decidere se alleggerire la seduta."
            >
                {Q.map(([k, l, hint]) => (
                    <div key={k} style={{ marginBottom: 6 }}>
                        <Field label={`${l} (${hint})`} value={v[k]} onChange={(x) => setV({ ...v, [k]: x })} width={60} />
                    </div>
                ))}
                {h && (
                    <Result tone={h.level === 'buono' ? 'green' : 'yellow'}>
                        <b>Totale {h.total}/28</b> -{' '}
                        {h.level === 'buono'
                            ? 'buona prontezza'
                            : h.level === 'attenzione'
                              ? 'attenzione: valuta di ridurre volume o intensità'
                              : 'prontezza bassa: considera una seduta di scarico o riposo'}{' '}
                        (soglie indicative)
                    </Result>
                )}
            </Card>
            <Card title="Come si misura il carico (sRPE di Foster)">
                <div style={{ fontSize: 13, color: '#333', lineHeight: 1.6 }}>
                    <p style={{ margin: '0 0 8px' }}>
                        <b>Carico della seduta</b> = RPE della seduta (scala 1-10, chiesto al cliente 30 minuti dopo) × durata in minuti. Si misura in unità
                        arbitrarie (AU).
                    </p>
                    <p style={{ margin: '0 0 8px' }}>
                        <b>Carico settimanale</b> = somma dei carichi delle sedute.
                    </p>
                    <p style={{ margin: '0 0 8px' }}>
                        <b>Monotonia</b> = media dei carichi giornalieri ÷ deviazione standard (7 giorni, riposi inclusi). Sopra 2: giorni troppo simili,
                        rischio di sovrallenamento.
                    </p>
                    <p style={{ margin: '0 0 8px' }}>
                        <b>Strain</b> = carico settimanale × monotonia. Un valore molto alto segnala stress cumulato.
                    </p>
                    <p style={{ margin: '0 0 8px' }}>
                        <b>Rapporto acuto:cronico (ACWR)</b> = carico della settimana ÷ media delle 4 precedenti. Zona ottimale 0,8-1,3; sopra 1,5 il rischio di
                        infortunio aumenta.
                    </p>
                    <p style={{ margin: 0 }}>
                        <b>Regola pratica</b>: non far crescere il carico settimanale di oltre il 10% alla volta, e programma uno scarico ogni 3-6 settimane.
                    </p>
                </div>
            </Card>
        </div>
    );
};
