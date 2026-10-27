import React, { useMemo, useState } from 'react';
import { firstLastPairs, labelOf } from '../logic/dataset';
import { comparePaired, fmt } from '../logic/report';
import { describe } from '../logic/stats/descriptive';
import { VarSelect } from '../ui/VarSelect';
import { AssumptionsCard, ResultCard } from '../ui/ResultCard';
import { PrePost } from '../ui/charts';

// Prima visita vs ultima visita dello stesso paziente: t appaiato / Wilcoxon
export const PairedPanel = ({ db, ds, includeExample }) => {
    const nums = ds.vars.filter((v) => v.type === 'num' && !['n_visite', 'eta_alla_visita', 'giorni_da_prima_visita', 'anno_nascita'].includes(v.key));
    const [y, setY] = useState(nums.find((v) => v.key === 'peso')?.key || '');
    const [force, setForce] = useState('auto');
    const pairs = useMemo(() => (y ? firstLastPairs(db, y, { includeExample }) : null), [db, y, includeExample]);
    const res = useMemo(() => (pairs ? comparePaired(pairs.pre, pairs.post, { force }) : null), [pairs, force]);
    const delta = pairs ? describe(pairs.post.map((v, i) => v - pairs.pre[i])) : null;

    return (
        <div className="rs-stack">
            <div className="panel rs-stack">
                <div className="rs-grid">
                    <VarSelect label="Variabile (numerica)" vars={nums} value={y} onChange={setY} />
                </div>
                <p className="rs-muted">Per ogni paziente con almeno due visite si confronta il primo valore misurato con l’ultimo.{pairs ? ` Pazienti utilizzabili: ${pairs.pre.length}.` : ''}</p>
            </div>
            {res && res.error && <p className="rs-muted panel">{res.error}</p>}
            {res && !res.error && (
                <>
                    <AssumptionsCard checks={res.checks} force={force} setForce={setForce} parametric={res.parametric} />
                    <ResultCard result={res.main} outcome={labelOf(y)}>
                        <p className="rs-muted">
                            Variazione media (ultima − prima): {fmt(delta.mean)} (DS {fmt(delta.sd)}), mediana {fmt(delta.median)}.
                        </p>
                        <PrePost pre={pairs.pre} post={pairs.post} names={['Prima visita', 'Ultima visita']} />
                    </ResultCard>
                    <ResultCard result={res.alt} outcome={labelOf(y)} title={`Alternativa: ${res.alt.test}`} />
                </>
            )}
        </div>
    );
};
