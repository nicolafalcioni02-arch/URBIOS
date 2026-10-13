import React, { useMemo } from 'react';
import { PATIENT_FIELDS, BIRTH_MODES, DATE_MODES, ID_MODES, detectFreeTextKeys, defaultAnonOptions } from '../../../../dataExchange/anonymize';
import { Check, Select, Btn } from './ui';

const groups = PATIENT_FIELDS.reduce((acc, f) => ((acc[f.group] = acc[f.group] || []).push(f), acc), {});

export const AnonymizePanel = ({ db, value, onChange }) => {
    const detected = useMemo(() => detectFreeTextKeys(db), [db]);
    const set = (patch) => onChange({ ...value, ...patch });
    const keys = value.freeTextKeys || detected;
    const setField = (k, v) => set({ removeFields: { ...value.removeFields, [k]: v } });

    const loose = () =>
        set({
            ...defaultAnonOptions(),
            removeFields: Object.fromEntries(PATIENT_FIELDS.map((f) => [f.key, ['nome', 'cognome', 'cf', 'cellulare', 'email', 'indirizzo'].includes(f.key)])),
            birth: 'year',
            dates: 'month',
            removeFreeText: false,
        });

    return (
        <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-bold text-gray-600">Impostazioni di partenza:</span>
                <Btn variant="light" onClick={() => onChange(defaultAnonOptions())}>
                    Rigorosa (consigliata)
                </Btn>
                <Btn variant="light" onClick={loose}>
                    Solo anagrafica
                </Btn>
            </div>

            {Object.entries(groups).map(([g, fields]) => (
                <div key={g} className="mb-3">
                    <p className="text-[11px] font-bold text-gray-500 mb-1">{g} · spunta ciò che va RIMOSSO</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        {fields.map((f) => (
                            <Check key={f.key} label={f.label} checked={value.removeFields[f.key]} onChange={(v) => setField(f.key, v)} />
                        ))}
                    </div>
                </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                <div>
                    <p className="text-[11px] font-bold text-gray-500 mb-1">Data di nascita</p>
                    <Select value={value.birth} onChange={(v) => set({ birth: v })} options={BIRTH_MODES} />
                </div>
                <div>
                    <p className="text-[11px] font-bold text-gray-500 mb-1">Date delle visite</p>
                    <Select value={value.dates} onChange={(v) => set({ dates: v })} options={DATE_MODES} />
                </div>
                <div>
                    <p className="text-[11px] font-bold text-gray-500 mb-1">ID paziente</p>
                    <Select value={value.idMode} onChange={(v) => set({ idMode: v })} options={ID_MODES} />
                </div>
            </div>

            <Check
                label="Rimuovi i testi liberi nelle visite"
                hint="Nei testi si scrivono spesso nomi e dettagli: è la fonte di fuga più comune. Spunta sotto quali campi togliere."
                checked={value.removeFreeText}
                onChange={(v) => set({ removeFreeText: v })}
            />
            {value.removeFreeText && (
                <div className="ml-7 mb-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    {detected.map((k) => (
                        <Check
                            key={k}
                            label={<code className="text-xs">{k}</code>}
                            checked={keys.includes(k)}
                            onChange={(v) => set({ freeTextKeys: v ? [...new Set([...keys, k])] : keys.filter((x) => x !== k) })}
                        />
                    ))}
                </div>
            )}
            <Check
                label="Controllo di sicurezza sui testi rimasti"
                hint="Cancella automaticamente nome, cognome, codice fiscale, email e telefono se compaiono ancora dentro un testo."
                checked={value.maskIdentifiers}
                onChange={(v) => set({ maskIdentifiers: v })}
            />
            <Check label="Includi i dati del professionista / studio" checked={value.includeProfessional} onChange={(v) => set({ includeProfessional: v })} />

            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
                Togliere i nomi non rende i dati <strong>anonimi in senso assoluto</strong>: età, patologia e città insieme possono rendere riconoscibile una
                persona. Per la ricerca tieni il minimo necessario. Le date esatte e gli ID visita (che nascondono data e ora) vengono comunque
                rimossi/rinumerati quando scegli le date relative.
            </p>
        </div>
    );
};
