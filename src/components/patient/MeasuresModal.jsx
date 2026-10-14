import React, { useMemo } from 'react';

// Misure del paziente registrate in archivio: per ogni dato l'ultimo valore trovato nelle visite, con la data.
// Serve a consultarle al volo mentre si lavora su Dieta o Training.

const LABELS = {
    altezza: 'Altezza', cm_collo: 'Collo', cm_torace: 'Torace', cm_vita_min: 'Vita', cm_fianchi_max: 'Fianchi',
    dm_omero: 'Omero', dm_femore: 'Femore', dm_polso: 'Polso', dm_biacrom: 'Biacromiale', dm_biiliaco: 'Biiliaco', dm_torace_trasv: 'Torace trasv.',
    pl_pettorale: 'Pettorale', pl_tricipite: 'Tricipite', pl_bicipite: 'Bicipite', pl_sottoscap: 'Sottoscapolare', pl_ascellare: 'Ascellare',
    pl_addome: 'Addome', pl_sovrailiaca: 'Sovrailiaca', pl_coscia: 'Coscia', pl_polpaccio: 'Polpaccio',
};
const label = (k) => {
    if (LABELS[k]) return LABELS[k];
    const t = k.replace(/^(circ|len)_/, '').replace(/_(sx|dx)$/, ' $1').replace(/_/g, ' ');
    return t.charAt(0).toUpperCase() + t.slice(1);
};
const GROUPS = [
    { title: 'Circonferenze', test: (k) => /^(cm_|circ_)/.test(k), unit: 'cm' },
    { title: 'Diametri', test: (k) => /^dm_/.test(k), unit: 'cm' },
    { title: 'Lunghezze', test: (k) => /^len_/.test(k), unit: 'cm' },
    { title: 'Pliche', test: (k) => /^pl_/.test(k), unit: 'mm' },
];
const has = (v) => String(v ?? '').trim() !== '';

export const MeasuresModal = ({ patient, onClose }) => {
    const data = useMemo(() => {
        const visits = [...(patient.visite || [])].sort((a, b) => String(b.data).localeCompare(String(a.data)));
        const latest = {}; // chiave -> { v, data }
        visits.forEach((vis) => {
            const d = { ...(vis.dettagli || {}), peso: vis.peso };
            Object.keys(d).forEach((k) => {
                if (!latest[k] && has(d[k]) && /^(peso|altezza|cm_|circ_|dm_|len_|pl_)/.test(k)) latest[k] = { v: d[k], data: vis.data };
            });
        });
        const fm = visits.map((v) => v.dettagli?.risultati_metodo_A?.fm_percent).find((x) => has(x) && x !== '--');
        const birth = patient.dataNascita ? new Date(patient.dataNascita) : null;
        const age = birth && !Number.isNaN(birth.getTime()) ? Math.floor((Date.now() - birth.getTime()) / (365.2425 * 24 * 3600 * 1000)) : null;
        const w = parseFloat(latest.peso?.v), h = parseFloat(latest.altezza?.v);
        const bmi = w && h ? (w / ((h / 100) ** 2)).toFixed(1) : null;
        return { latest, fm, age, bmi, n: visits.length };
    }, [patient]);

    const { latest } = data;
    const main = [
        ['Età', data.age != null ? `${data.age} anni` : null],
        ['Sesso', patient.sesso ? (String(patient.sesso).toUpperCase() === 'F' ? 'Donna' : 'Uomo') : null],
        ['Peso', latest.peso ? `${latest.peso.v} kg` : null, latest.peso?.data],
        ['Altezza', latest.altezza ? `${latest.altezza.v} cm` : null, latest.altezza?.data],
        ['BMI', data.bmi],
        ['Massa grassa', data.fm ? `${data.fm} %` : null],
    ];

    return (
        <div className="dg-overlay" onMouseDown={(ev) => ev.target === ev.currentTarget && onClose()}>
            <div className="dg-modal">
                <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 pb-4 border-b border-[color:var(--line)] flex-none">
                    <div className="w-9 h-9 rounded-full grid place-items-center" style={{ background: 'var(--soft)' }}>
                        <i className="ph ph-ruler text-lg"></i>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-[18px] font-semibold leading-tight">Misure di {patient.nome}</h2>
                        <p className="text-[12.5px] text-[color:var(--muted)]">Ultimi valori registrati in {data.n} {data.n === 1 ? 'visita' : 'visite'}</p>
                    </div>
                    <button className="dg-ghost" onClick={onClose} aria-label="Chiudi">
                        <i className="ph ph-x"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 sm:p-7">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {main.map(([l, v, d]) => (
                            <div key={l} className="rounded-2xl p-3.5" style={{ background: 'var(--soft)' }}>
                                <p className="text-[12px] text-[color:var(--muted)]">{l}</p>
                                <p className="text-[20px] font-semibold leading-tight mt-0.5">{v || '—'}</p>
                                {d && <p className="text-[11px] text-[color:var(--muted)] mt-0.5">{d}</p>}
                            </div>
                        ))}
                    </div>

                    {GROUPS.map((g) => {
                        const keys = Object.keys(latest).filter(g.test);
                        if (!keys.length) return null;
                        return (
                            <section key={g.title} className="mt-6">
                                <p className="text-[12px] font-semibold uppercase tracking-wider text-[color:var(--muted)] mb-2">{g.title}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                    {keys.map((k) => (
                                        <div key={k} className="flex items-baseline justify-between py-2 border-b border-[color:var(--line)] text-[14px]">
                                            <span>{label(k)}</span>
                                            <span className="font-medium">
                                                {latest[k].v} <span className="text-[color:var(--muted)] font-normal text-[12px]">{g.unit}</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}

                    {data.n === 0 && <p className="text-[14px] text-[color:var(--muted)] mt-4">Nessuna visita registrata: le misure compaiono dopo la prima visita.</p>}
                </div>
            </div>
        </div>
    );
};
