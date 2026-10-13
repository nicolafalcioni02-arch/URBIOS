import React, { useState } from 'react';
import { Card, Field, Pick, Result, n1, toNum } from './ui';
import { MET_ACTIVITIES, kcalFromMet, acsmWalkingVo2, acsmRunningVo2, acsmCyclingVo2, kcalFromVo2, metFromVo2 } from '../logic/science/energy';

export const EnergyTool = ({ profile }) => {
    const p = profile || {};
    const [kg, setKg] = useState(p.weightKg ? String(p.weightKg) : '');
    const [act, setAct] = useState('rt_light');
    const [min, setMin] = useState('60');
    const [net, setNet] = useState(false);
    const [mode, setMode] = useState('run');
    const [speed, setSpeed] = useState('10');
    const [grade, setGrade] = useState('0');
    const [watts, setWatts] = useState('100');
    const [amin, setAmin] = useState('30');

    const met = (MET_ACTIVITIES.find((a) => a.id === act) || {}).met;
    const k1 = kcalFromMet(met, toNum(kg), toNum(min), { net });
    const vo2 =
        mode === 'run'
            ? acsmRunningVo2(toNum(speed), toNum(grade))
            : mode === 'walk'
              ? acsmWalkingVo2(toNum(speed), toNum(grade))
              : acsmCyclingVo2(toNum(watts), toNum(kg));
    const k2 = kcalFromVo2(vo2, toNum(kg), toNum(amin));

    return (
        <div>
            <Card
                title="Dispendio energetico con i MET"
                hint="kcal = MET × peso (kg) × ore. I valori MET sono medie del Compendium of Physical Activities (Ainsworth et al., 2011): sono stime, non misure. 'Netto' toglie il metabolismo a riposo (1 MET): è la quota davvero 'in più' dovuta all'attività."
            >
                <Field label="Peso" value={kg} onChange={setKg} unit="kg" width={70} />
                <Pick
                    label="Attività"
                    value={act}
                    onChange={setAct}
                    options={MET_ACTIVITIES.map((a) => ({ value: a.id, label: `${a.group}: ${a.label} (${a.met} MET)` }))}
                    width={420}
                />
                <Field label="Durata" value={min} onChange={setMin} unit="min" width={70} />
                <label style={{ fontSize: 13, marginLeft: 6 }}>
                    <input type="checkbox" checked={net} onChange={(e) => setNet(e.target.checked)} /> Solo quota netta
                </label>
                {k1 > 0 && (
                    <Result>
                        <b>≈ {Math.round(k1)} kcal</b> ({net ? 'netto' : 'lordo'}) · {n1((k1 / toNum(min)) * 60, 0)} kcal/ora
                    </Result>
                )}
            </Card>

            <Card
                title="Tapis roulant / cyclette (equazioni ACSM)"
                hint="Più precise dei MET per corsa, cammino e bici ergometro: usano velocità, pendenza o watt. Valide per andature regolari."
            >
                <Pick
                    label="Tipo"
                    value={mode}
                    onChange={setMode}
                    options={[
                        { value: 'run', label: 'Corsa su tapis roulant' },
                        { value: 'walk', label: 'Camminata su tapis roulant' },
                        { value: 'bike', label: 'Cyclette (potenza)' },
                    ]}
                    width={210}
                />
                {mode !== 'bike' ? (
                    <>
                        <Field label="Velocità" value={speed} onChange={setSpeed} unit="km/h" width={70} />
                        <Field label="Pendenza" value={grade} onChange={setGrade} unit="%" width={60} />
                    </>
                ) : (
                    <Field label="Potenza" value={watts} onChange={setWatts} unit="W" width={70} />
                )}
                <Field label="Durata" value={amin} onChange={setAmin} unit="min" width={70} />
                {Number.isFinite(vo2) && k2 > 0 && (
                    <Result>
                        VO₂ richiesto: <b>{n1(vo2)} ml/kg/min</b> (≈ {n1(metFromVo2(vo2))} MET) → <b>≈ {Math.round(k2)} kcal</b> in {amin} min ·{' '}
                        {n1((k2 / toNum(amin)) * 60, 0)} kcal/ora
                    </Result>
                )}
            </Card>
            <Card>
                <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>
                    Le sedute di pesi della scheda vengono stimate in automatico dall'<b>Analisi della scheda</b> (MET da 3,5 a 6 in base all'RPE medio, sulla
                    durata stimata della seduta). L'allenamento con i pesi spende meno kcal di quanto si pensi: il suo valore è soprattutto nella massa
                    muscolare e nel metabolismo a riposo.
                </div>
            </Card>
        </div>
    );
};
