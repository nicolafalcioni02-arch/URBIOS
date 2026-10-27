import React, { useState } from 'react';
import { Page, Group, Btn, IconBtn, Field, Select } from '../../ui/kit';
import { copyText } from '../../ui/clipboard';
import { FORMULA_PROMPT } from './formulaPrompt';

const CATEGORIES = ['Generale', 'Densità Corporea', 'BIVA', 'Metabolismo', 'Formule Pliche', 'Conversione %FM'];
const EMPTY = { categoria: 'Generale', titolo: '', equazione: '', note: '' };

// Archivio delle formule (db.formule)
export const FormulasTab = ({ db, onUpdateDb }) => {
    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState(EMPTY);
    const [copied, setCopied] = useState(false);
    const formule = db.formule || [];
    const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target ? e.target.value : e }));

    const add = () => {
        if (!draft.titolo || !draft.equazione) return alert('Inserisci almeno titolo ed equazione.');
        onUpdateDb((prev) => ({ ...prev, formule: [{ ...draft, id: Date.now() }, ...(prev.formule || [])] }));
        setDraft(EMPTY);
        setAdding(false);
    };
    const remove = (id) => confirm('Vuoi rimuovere questa formula?') && onUpdateDb((prev) => ({ ...prev, formule: (prev.formule || []).filter((f) => f.id !== id) }));
    const copyPrompt = async () => {
        if (await copyText(FORMULA_PROMPT)) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
        }
    };

    return (
        <Page
            title="Formule"
            intro="Le equazioni di riferimento usate nei calcoli."
            actions={
                <Btn variant={adding ? 'secondary' : 'primary'} icon={adding ? 'minus' : 'plus'} onClick={() => setAdding(!adding)}>
                    {adding ? 'Annulla' : 'Aggiungi'}
                </Btn>
            }
        >
            {adding && (
                <Group title="Nuova formula" className="fade-enter">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Titolo" placeholder="Es. Formula di Katch-McArdle" value={draft.titolo} onChange={set('titolo')} />
                        <label className="block">
                            <span className="fld-label">Categoria</span>
                            <Select value={draft.categoria} onChange={set('categoria')} options={CATEGORIES} />
                        </label>
                        <Field className="md:col-span-2" label="Equazione" placeholder="Es. BMR = 370 + (21.6 * LBM)" value={draft.equazione} onChange={set('equazione')} />
                        <Field className="md:col-span-2" label="Note" placeholder="Fonte, limiti, popolazione…" value={draft.note} onChange={set('note')} />
                    </div>
                    <div className="flex justify-end mt-4">
                        <Btn icon="check" onClick={add}>
                            Salva formula
                        </Btn>
                    </div>
                </Group>
            )}

            <Group
                title="Farsi scrivere una formula"
                icon="clipboard"
                hint="Copia le istruzioni e incollale in un assistente come ChatGPT o Gemini, poi chiedi la formula che ti serve: ti restituisce l'equazione già nel formato giusto."
                aside={
                    <Btn variant="secondary" size="sm" icon={copied ? 'check' : 'copy'} onClick={copyPrompt}>
                        {copied ? 'Copiate' : 'Copia istruzioni'}
                    </Btn>
                }
            />

            <Group title={`Archivio · ${formule.length}`}>
                {formule.length ? (
                    <div className="st-list">
                        {formule.map((f) => (
                            <div key={f.id} className="st-item">
                                <IconBtn icon="trash" label="Elimina formula" className="st-item-del" onClick={() => remove(f.id)} />
                                <span className="st-tag">{f.categoria}</span>
                                <p className="mt-1.5 text-[15px] font-semibold text-[color:var(--ink)]">{f.titolo}</p>
                                <div className="st-code">{f.equazione}</div>
                                {f.note && <p className="st-hint">{f.note}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="st-empty">Nessuna formula. Aggiungine una con il tasto in alto.</p>
                )}
            </Group>
        </Page>
    );
};
