import React, { useMemo, useState } from 'react';
import { groupingVars, labelOf, splitBy } from '../logic/dataset';
import { compareGroups } from '../logic/report';
import { VarSelect } from '../ui/VarSelect';
import { AssumptionsCard, ResultCard } from '../ui/ResultCard';
import { BoxPlot } from '../ui/charts';

// Confronto tra gruppi indipendenti: t di Welch / Mann-Whitney (2 gruppi), ANOVA / Kruskal-Wallis (3+ gruppi)
export const ComparePanel = ({ ds }) => {
    const nums = ds.vars.filter((v) => v.type === 'num');
    const groupsV = groupingVars(ds);
    const [y, setY] = useState(nums.find((v) => v.key === 'peso')?.key || '');
    const [g, setG] = useState(groupsV.find((v) => v.key === 'sesso')?.key || '');
    const [force, setForce] = useState('auto');
    const [only, setOnly] = useState([]); // gruppi esclusi

    const all = useMemo(() => (y && g ? splitBy(ds, y, g) : []), [ds, y, g]);
    const groups = all.filter((x) => !only.includes(x.name));
    const res = useMemo(() => (groups.length ? compareGroups(groups, { force }) : null), [groups, force]);

    return (
        <div className="rs-stack">
            <div className="panel rs-stack">
                <div className="rs-grid">
                    <VarSelect label="Variabile da confrontare (numerica)" vars={nums} value={y} onChange={setY} />
                    <VarSelect label="Gruppi definiti da" vars={groupsV} value={g} onChange={(v) => (setG(v), setOnly([]))} exclude={[y]} />
                </div>
                {all.length > 2 && (
                    <div className="rs-pick">
                        {all.map((x) => (
                            <label key={x.name} className={only.includes(x.name) ? '' : 'on'}>
                                <input type="checkbox" className="sr-only" checked={!only.includes(x.name)} onChange={() => setOnly((o) => (o.includes(x.name) ? o.filter((n) => n !== x.name) : [...o, x.name]))} />
                                {x.name}
                            </label>
                        ))}
                    </div>
                )}
                {groupsV.length === 0 && <p className="rs-muted">Nessuna variabile con almeno due gruppi (es. sesso con M e F) nel dataset attuale.</p>}
            </div>
            {res && res.error && <p className="rs-muted panel">{res.error}</p>}
            {res && !res.error && (
                <>
                    <AssumptionsCard checks={res.checks} force={force} setForce={setForce} parametric={res.parametric} />
                    <ResultCard result={res.main} outcome={labelOf(y)}>
                        <BoxPlot groups={groups} />
                    </ResultCard>
                    <ResultCard result={res.alt} outcome={labelOf(y)} title={`Alternativa: ${res.alt.test}`} />
                </>
            )}
        </div>
    );
};
