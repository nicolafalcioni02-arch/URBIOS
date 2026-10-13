import React from 'react';
import { Card, Table } from './ui';
import { GOALS, LEVELS, WEEKLY_SETS, MAX_SETS_PER_SESSION, MIN_FREQUENCY, CARDIO_WEEKLY_MIN } from '../logic/science/guidelines';

export const GuidelinesTool = () => (
    <div>
        <Card
            title="Parametri per obiettivo"
            hint="Indicazioni di riferimento (ACSM, NSCA, Schoenfeld, Helms): vanno adattate alla persona, al suo livello e alla sua storia."
        >
            <Table
                small
                head={['Obiettivo', 'Ripetizioni', '% 1RM', 'Recupero', 'RPE', 'Tempo']}
                rows={GOALS.map((g) => [
                    <b key={g.id}>{g.label}</b>,
                    `${g.reps[0]}-${g.reps[1]}`,
                    `${g.pct[0]}-${g.pct[1]}%`,
                    `${g.rest[0]}-${g.rest[1]} s`,
                    `${g.rpe[0]}-${g.rpe[1]}`,
                    g.tempo,
                ])}
            />
            <div style={{ marginTop: 10, fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                {GOALS.map((g) => (
                    <div key={g.id}>
                        <b>{g.label}.</b> {g.hint}
                    </div>
                ))}
            </div>
        </Card>
        <Card
            title="Serie dirette settimanali per gruppo muscolare"
            hint={`Intervalli indicativi per muscolo. Le serie "indirette" (muscoli secondari) contano meno: l'analisi le conteggia al 50%. Oltre ~${MAX_SETS_PER_SESSION} serie dirette per muscolo in una sola seduta il beneficio marginale cala. Frequenza consigliata: almeno ${MIN_FREQUENCY} volte a settimana per muscolo (ipertrofia).`}
        >
            <Table
                small
                head={['Obiettivo', ...LEVELS.map((l) => l.id)]}
                rows={Object.entries(WEEKLY_SETS).map(([g, v]) => [GOALS.find((x) => x.id === g).label, ...LEVELS.map((l) => `${v[l.id][0]}-${v[l.id][1]}`)])}
            />
        </Card>
        <Card title="Livello e frequenza">
            <Table small head={['Livello', 'Sedute', 'Nota']} rows={LEVELS.map((l) => [l.label, l.sessions, l.note])} />
        </Card>
        <Card
            title="Attività aerobica"
            hint={`Salute generale (OMS/ACSM): ${CARDIO_WEEKLY_MIN[0]}-${CARDIO_WEEKLY_MIN[1]} minuti a settimana di attività aerobica moderata, oppure 75-150 minuti di intensa. Per il dimagrimento la quantità richiesta è spesso maggiore, ma il deficit energetico viene soprattutto dall'alimentazione.`}
        />
        <Card
            title="Scarico (deload)"
            hint="Ogni 3-6 settimane (prima nei più avanzati) una settimana con ~40% di volume in meno e carichi lievemente ridotti, per consolidare gli adattamenti e prevenire il sovrallenamento."
        />
    </div>
);
