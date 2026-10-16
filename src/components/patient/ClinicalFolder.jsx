import React from 'react';
import { InputGroup } from '../ui/InputGroup';
import { DocumentsPanel } from './info/DocumentsPanel';
import { docsSummary, fmtDate } from './info/documentsLogic';

// stato del percorso del paziente (compare nella testata e nell'elenco)
const STATUSES = [
    { id: 'Attivo', icon: 'ph-pulse', hint: 'In cura, ha visite e piani in corso', tone: 'var(--ok)' },
    { id: 'In pausa', icon: 'ph-pause-circle', hint: 'Percorso sospeso, potrebbe riprendere', tone: 'var(--warn)' },
    { id: 'Ex paziente', icon: 'ph-archive', hint: 'Percorso concluso', tone: '#8E8E93' },
];

const ageOf = (iso) => {
    const b = new Date(iso);
    if (!iso || isNaN(b)) return null;
    const t = new Date();
    let a = t.getFullYear() - b.getFullYear();
    if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
    return a;
};

// la luce sul vetro segue il puntatore (sul touch resta ferma)
const followLight = (e) => {
    if (e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
};

const Group = ({ title, children }) => (
    <div className="an-group">
        <p className="vd-group-title">{title}</p>
        <div className="an-fields">{children}</div>
    </div>
);

// Scheda paziente: in alto chi è il paziente, poi i documenti da firmare e i dati fissi (l'anamnesi è il primo passo di Nuova visita)
export const ClinicalFolder = ({ patient, updatePatientInfo, professionalData }) => {
    const age = ageOf(patient.dataNascita);
    const visite = [...(patient.visite || [])].sort((a, b) => new Date(b.data) - new Date(a.data));
    const { firmati, totale } = docsSummary(patient);
    const initials = `${(patient.nome || '').charAt(0)}${(patient.cognome || '').charAt(0)}`.toUpperCase();
    const facts = [
        patient.professione && { icon: 'ph-briefcase', text: patient.professione },
        patient.cellulare && { icon: 'ph-phone', text: patient.cellulare },
        patient.email && { icon: 'ph-envelope-simple', text: patient.email },
        (patient.citta || patient.luogoNascita) && { icon: 'ph-map-pin', text: patient.citta || patient.luogoNascita },
    ].filter(Boolean);

    return (
        <div className="anag-grid an-root fade-enter pb-32">
            <section className="an-hero">
                <div className="an-id rise" onPointerMove={followLight}>
                  <div className="an-glass">
                    <div className="an-avatar" aria-hidden="true">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <h3 className="an-name">
                            {patient.nome} {patient.cognome}
                        </h3>
                        <p className="an-sub">{[age !== null && `${age} anni`, patient.sesso === 'F' ? 'Donna' : 'Uomo', patient.status].filter(Boolean).join(' · ')}</p>
                        {facts.length > 0 ? (
                            <ul className="an-facts">
                                {facts.map((f) => (
                                    <li key={f.text}>
                                        <i className={`ph ${f.icon}`}></i>
                                        <span className="truncate">{f.text}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="an-facts-empty">Aggiungi i recapiti qui sotto</p>
                        )}
                    </div>
                  </div>
                </div>

                <div className="an-tiles">
                    <div className="vd-tile rise" style={{ animationDelay: '.08s' }}>
                        <p className="vd-tile-label">Visite</p>
                        <p className="vd-tile-fig">{visite.length}</p>
                        <p className="an-tile-note">{visite[0] ? `ultima il ${fmtDate(visite[0].data)}` : 'nessuna per ora'}</p>
                    </div>
                    <div className="vd-tile rise" style={{ animationDelay: '.16s' }}>
                        <p className="vd-tile-label">Documenti</p>
                        <p className="vd-tile-fig">
                            {firmati}
                            <small>/ {totale} firmati</small>
                        </p>
                        <span className="an-bars" aria-hidden="true">
                            {Array.from({ length: totale }, (_, i) => (
                                <i key={i} className={i < firmati ? 'on' : ''}></i>
                            ))}
                        </span>
                    </div>
                </div>
            </section>

            <div className="an-cols">
                <div className="an-left">
                    <DocumentsPanel patient={patient} professionalData={professionalData} updatePatientInfo={updatePatientInfo} />

                    <section className="panel an-status">
                        <h4 className="vd-h">
                            <span className="vd-h-ico">
                                <i className="ph ph-flag"></i>
                            </span>
                            Stato del paziente
                        </h4>
                        <div className="an-stseg" role="radiogroup" aria-label="Stato del paziente">
                            {STATUSES.map((st) => {
                                const on = (patient.status || 'Attivo') === st.id;
                                return (
                                    <button key={st.id} role="radio" aria-checked={on} className={on ? 'on' : ''} style={{ '--tone': st.tone }} onClick={() => updatePatientInfo('status', st.id)}>
                                        <i className="an-stdot"></i>
                                        {st.id}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="an-st-hint">{(STATUSES.find((st) => st.id === (patient.status || 'Attivo')) || STATUSES[0]).hint}</p>
                    </section>
                </div>

                <section className="panel an-data">
                    <h4 className="vd-h">
                        <span className="vd-h-ico">
                            <i className="ph ph-identification-card"></i>
                        </span>
                        Dati anagrafici
                    </h4>
                    <Group title="Identità">
                        <InputGroup label="Nome" value={patient.nome} name="nome" onChange={updatePatientInfo} />
                        <InputGroup label="Cognome" value={patient.cognome} name="cognome" onChange={updatePatientInfo} />
                        <InputGroup label="Sesso biologico" options={['M', 'F']} value={patient.sesso || 'M'} name="sesso" onChange={updatePatientInfo} />
                        <InputGroup label="Data di nascita" type="date" value={patient.dataNascita} name="dataNascita" onChange={updatePatientInfo} />
                        <InputGroup label="Comune di nascita" placeholder="Comune" value={patient.luogoNascita} name="luogoNascita" onChange={updatePatientInfo} />
                        <InputGroup label="Provincia" placeholder="MI" maxLength={2} inputClass="uppercase" value={patient.provinciaNascita} name="provinciaNascita" onChange={(k, v) => updatePatientInfo(k, String(v || '').toUpperCase().replace(/[^A-Z]/g, ''))} />
                        <InputGroup label="Codice fiscale" placeholder="16 caratteri" inputClass="!text-[12.5px] !tracking-[-0.02em] !px-2.5 uppercase" value={patient.cf} name="cf" onChange={updatePatientInfo} />
                        <InputGroup
                            label="Stato civile"
                            options={['Celibe/Nubile', 'Coniugato/a', 'Divorziato/a', 'Vedovo/a']}
                            value={patient.statoCivile}
                            name="statoCivile"
                            onChange={updatePatientInfo}
                        />
                        <div className="an-span-all">
                            <InputGroup label="Professione" placeholder="Es. Impiegato" grow value={patient.professione} name="professione" onChange={updatePatientInfo} />
                        </div>
                    </Group>
                    <Group title="Recapiti">
                        <InputGroup label="Cellulare" type="tel" placeholder="+39..." value={patient.cellulare} name="cellulare" onChange={updatePatientInfo} />
                        <div className="an-span2">
                            <InputGroup label="Email" type="email" value={patient.email} name="email" onChange={updatePatientInfo} />
                        </div>
                        <InputGroup label="CAP" placeholder="00000" value={patient.cap} name="cap" onChange={updatePatientInfo} />
                        <div className="an-span2">
                            <InputGroup label="Indirizzo" placeholder="Via..." grow value={patient.indirizzo} name="indirizzo" onChange={updatePatientInfo} />
                        </div>
                        <div className="an-span2">
                            <InputGroup label="Città" placeholder="Milano" grow value={patient.citta} name="citta" onChange={updatePatientInfo} />
                        </div>
                    </Group>
                </section>
            </div>
        </div>
    );
};
