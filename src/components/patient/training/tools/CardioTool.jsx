import React, { useState } from 'react';
import { Card, Field, Pick, Result, Table, n1, toNum } from './ui';
import { HRMAX_FORMULAS, hrMax, karvonenZones, percentMaxZones, trimp, cooperVo2, rockportVo2, vo2Class } from '../logic/science/heartRate';

export const CardioTool = ({ profile }) => {
    const p = profile || {};
    const [age, setAge] = useState(p.age ? String(p.age) : '');
    const [formula, setFormula] = useState('tanaka');
    const [rest, setRest] = useState('');
    const [manualMax, setManualMax] = useState('');
    const [sex, setSex] = useState(p.sex || 'M');
    const [min, setMin] = useState('');
    const [avg, setAvg] = useState('');
    const [dist, setDist] = useState('');
    const [rkMin, setRkMin] = useState('');
    const [rkHr, setRkHr] = useState('');
    const [kg, setKg] = useState(p.weightKg ? String(p.weightKg) : '');

    const max = toNum(manualMax) > 0 ? toNum(manualMax) : hrMax(toNum(age), formula);
    const kz = karvonenZones(max, toNum(rest));
    const pz = percentMaxZones(max);
    const tr = trimp({ minutes: toNum(min), hrAvg: toNum(avg), hrRest: toNum(rest), hrMax: max, sex });
    const cooper = cooperVo2(toNum(dist));
    const rock = rockportVo2({ weightKg: toNum(kg), age: toNum(age), sex, minutes: toNum(rkMin), hr: toNum(rkHr) });

    return (
        <div>
            <Card
                title="Frequenza cardiaca massima e zone"
                hint="Le formule sono stime sulla popolazione: la FC massima reale può differire di ±10 bpm. Se hai un valore misurato (test massimale), usalo."
            >
                <Field label="Età" value={age} onChange={setAge} unit="anni" width={70} />
                <Pick
                    label="Formula FCmax"
                    value={formula}
                    onChange={setFormula}
                    options={HRMAX_FORMULAS.map((f) => ({ value: f.id, label: f.label }))}
                    width={260}
                />
                <Field label="FCmax misurata (opz.)" value={manualMax} onChange={setManualMax} unit="bpm" width={80} />
                <Field label="FC a riposo" value={rest} onChange={setRest} unit="bpm" width={80} />
                {max && (
                    <Result>
                        <b>FC massima: {max} bpm</b>
                    </Result>
                )}
                {kz && (
                    <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Zone con il metodo di Karvonen (riserva cardiaca)</div>
                        <Table
                            small
                            head={['Zona', 'Battiti/min', '% riserva', 'Uso']}
                            rows={kz.map((z) => [z.name, `${z.bpmFrom} – ${z.bpmTo}`, `${z.from * 100}-${z.to * 100}%`, z.use])}
                        />
                    </div>
                )}
                {!kz && pz && (
                    <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                            Zone in % della FC massima (inserisci la FC a riposo per il metodo di Karvonen)
                        </div>
                        <Table small head={['Zona', 'Battiti/min', 'Uso']} rows={pz.map((z) => [z.name, `${z.bpmFrom} – ${z.bpmTo}`, z.use])} />
                    </div>
                )}
            </Card>

            <Card
                title="TRIMP (carico interno di una seduta aerobica)"
                hint="Trimp di Banister: tiene conto di durata e intensità cardiaca. Utile per confrontare sedute diverse. Serve FC a riposo e massima qui sopra."
            >
                <Pick
                    label="Sesso"
                    value={sex}
                    onChange={setSex}
                    options={[
                        { value: 'M', label: 'Uomo' },
                        { value: 'F', label: 'Donna' },
                    ]}
                    width={90}
                />
                <Field label="Durata" value={min} onChange={setMin} unit="min" width={70} />
                <Field label="FC media" value={avg} onChange={setAvg} unit="bpm" width={70} />
                {tr !== null && (
                    <Result>
                        <b>TRIMP ≈ {n1(tr, 0)}</b> unità arbitrarie
                    </Result>
                )}
            </Card>

            <Card title="Stima del VO₂max" hint="Test sul campo: sono stime (±10%).">
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Test di Cooper (12 minuti di corsa)</div>
                <Field label="Distanza percorsa" value={dist} onChange={setDist} unit="m" width={90} />
                {cooper !== null && (
                    <Result>
                        <b>VO₂max ≈ {n1(cooper)} ml/kg/min</b> — {vo2Class(cooper)} (valutazione indicativa: dipende da età e sesso)
                    </Result>
                )}
                <div style={{ fontSize: 12, fontWeight: 700, margin: '12px 0 6px' }}>Rockport (1 miglio = 1609 m camminando)</div>
                <Field label="Peso" value={kg} onChange={setKg} unit="kg" width={70} />
                <Field label="Tempo" value={rkMin} onChange={setRkMin} unit="min" width={70} />
                <Field label="FC a fine test" value={rkHr} onChange={setRkHr} unit="bpm" width={70} />
                {rock !== null && Number.isFinite(rock) && (
                    <Result>
                        <b>VO₂max ≈ {n1(rock)} ml/kg/min</b> — {vo2Class(rock)}
                    </Result>
                )}
            </Card>
        </div>
    );
};
