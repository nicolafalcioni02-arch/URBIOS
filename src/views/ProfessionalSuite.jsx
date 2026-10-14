import React, { useState, useMemo } from 'react';
import { SettingsModal } from './settings/SettingsModal';
import { PatientDetail } from './patientDetail/PatientDetail';
import { StudentMode } from './StudentMode';
import { useArchive } from '../storage/ArchiveProvider';
import { WidgetDock } from '../components/widgets/WidgetDock';
import { AgendaView } from './agenda/AgendaView';
import { dateKey, isActive, sameDay, startOf } from '../components/agenda/agendaLogic';

export const ProfessionalSuite = ({ data, onUpdateDb }) => {
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [studentMode, setStudentMode] = useState(false);
    const [adding, setAdding] = useState(false);
    const [petsOpen, setPetsOpen] = useState(false);
    const [studentSoonOpen, setStudentSoonOpen] = useState(false);
    const [widgetsEditing, setWidgetsEditing] = useState(false);
    const [agenda, setAgenda] = useState(null); // null = chiusa, altrimenti { date, open?, newAppt? }
    const [query, setQuery] = useState('');
    const [form, setForm] = useState({ nome: '', cognome: '', sesso: 'M' });
    const { dirty, ephemeral, saveFile, openExitDialog } = useArchive();

    const submitPatient = (e) => {
        e.preventDefault();
        const nome = form.nome.trim();
        const cognome = form.cognome.trim();
        if (!nome || !cognome) return;
        const newP = {
            id: Math.random().toString().substr(2, 6),
            nome,
            cognome,
            sesso: form.sesso,
            dataNascita: '',
            status: 'Attivo',
            visite: [],
        };
        onUpdateDb((prev) => ({ ...prev, pazienti: [...prev.pazienti, newP] }));
        setForm({ nome: '', cognome: '', sesso: 'M' });
        setAdding(false);
        setSelectedPatientId(newP.id); // si apre subito la scheda del nuovo paziente
    };

    const handleSave = async () => {
        try {
            await saveFile();
        } catch (e) {
            alert('Salvataggio non riuscito: ' + (e.message || e));
        }
    };

    const selectedPatient = useMemo(() => data.pazienti.find((p) => p.id === selectedPatientId), [data.pazienti, selectedPatientId]);

    // --- ROUTING ---
    if (studentMode) {
        return <StudentMode onExit={() => setStudentMode(false)} db={data} />;
    }

    const agendaView = agenda && (
        <>
            {showSettings && <SettingsModal db={data} onUpdateDb={onUpdateDb} onClose={() => setShowSettings(false)} />}
            <div className={selectedPatient ? 'fixed inset-0 z-[60] bg-[var(--paper)]' : 'h-full'}>
                <AgendaView
                    key={`${agenda.date}-${agenda.open || ''}-${agenda.newAppt ? 'n' : ''}`}
                    db={data}
                    onUpdateDb={onUpdateDb}
                    initial={agenda}
                    onBack={() => setAgenda(null)}
                    onOpenPatient={(id) => {
                        setAgenda(null);
                        setSelectedPatientId(id);
                    }}
                    onOpenSettings={() => setShowSettings(true)}
                />
            </div>
        </>
    );

    if (selectedPatientId && selectedPatient) {
        // la scheda resta montata sotto l'agenda: la visita in corso non si perde
        return (
            <>
                <PatientDetail key={selectedPatient.id} patient={selectedPatient} onBack={() => setSelectedPatientId(null)} onUpdateDb={onUpdateDb} db={data} onOpenAgenda={(o) => setAgenda({ date: dateKey(new Date()), ...o })} />
                {agendaView}
            </>
        );
    }
    if (agenda) return agendaView;

    // --- SCHERMATA PRINCIPALE ---
    const q = query.trim().toLowerCase();
    const list = q ? data.pazienti.filter((p) => `${p.nome} ${p.cognome} ${p.id}`.toLowerCase().includes(q)) : data.pazienti;
    const todayAppts = (data.agenda || []).filter((a) => isActive(a) && sameDay(startOf(a), new Date())).length;
    const lastVisit = (p) => (p.visite.length ? new Date(p.visite[0].data).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Nessuna visita');

    return (
        <div className="h-full w-full bg-[var(--paper)] overflow-y-auto font-sans">
            {showSettings && <SettingsModal db={data} onUpdateDb={onUpdateDb} onClose={() => setShowSettings(false)} />}

            {/* Scrivania laterale: solo desktop largo (il componente si nasconde da solo su schermi più piccoli) */}
            <WidgetDock db={data} onUpdateDb={onUpdateDb} editing={widgetsEditing} onEditingChange={setWidgetsEditing} onOpenAgenda={(o) => setAgenda({ date: dateKey(new Date()), ...o })} />

            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 pb-24">
                {/* Barra alta: marchio a sinistra, azioni secondarie a destra */}
                <div className="flex items-center justify-between mb-8 sm:mb-12 rise">
                    <span className="text-[13px] font-semibold tracking-[0.32em] text-[color:var(--ink)]">URBIOS</span>
                    <div className="flex items-center gap-1">
                        {/* Student: bloccata per ora (codice intatto in StudentMode.jsx). Per riattivarla: setStudentMode(true) al posto di setStudentSoonOpen(true) */}
                        <button onClick={() => setStudentSoonOpen(true)} className="home-quiet" title="Student: in arrivo">
                            <i className="ph ph-student"></i>
                            <span className="hidden sm:inline">Student</span>
                            <span className="pets-soon">presto</span>
                        </button>
                        <button onClick={() => setPetsOpen(true)} className="home-quiet" title="Pets: in arrivo">
                            <i className="ph ph-dog"></i>
                            <span>Pets</span>
                            <span className="pets-soon">presto</span>
                        </button>
                        <button onClick={() => setWidgetsEditing((v) => !v)} className="home-quiet max-[1359px]:!hidden" title="Modifica i widget laterali (tieni premuto su un widget per fare lo stesso)">
                            <i className={`ph ${widgetsEditing ? 'ph-check' : 'ph-squares-four'}`}></i>
                            <span>{widgetsEditing ? 'Fine' : 'Widget'}</span>
                        </button>
                        <button onClick={() => setAgenda({ date: dateKey(new Date()) })} className="home-quiet" title="Agenda e appuntamenti">
                            <i className="ph ph-calendar-dots"></i>
                            <span className="hidden sm:inline">Agenda</span>
                            {todayAppts > 0 && <span className="pets-soon">{todayAppts}</span>}
                        </button>
                        <button onClick={() => setShowSettings(true)} className="home-quiet" title="Impostazioni e formule">
                            <i className="ph ph-gear"></i>
                            <span className="hidden sm:inline">Impostazioni</span>
                        </button>
                        {!ephemeral && dirty && (
                            <button onClick={handleSave} className="home-quiet" style={{ color: 'var(--bad)' }}>
                                <i className="ph ph-floppy-disk"></i>
                                <span>Salva</span>
                            </button>
                        )}
                        <button onClick={openExitDialog} className="home-quiet" title="Esci">
                            <i className="ph ph-sign-out"></i>
                            <span className="hidden sm:inline">Esci</span>
                        </button>
                    </div>
                </div>

                {/* Titolo e azione principale */}
                <div className="flex flex-wrap items-end justify-between gap-4 mb-5 rise" style={{ animationDelay: '.05s' }}>
                    <div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 600 }} className="text-[40px] sm:text-[52px] leading-none text-[color:var(--ink)]">
                            Pazienti
                        </h1>
                        <p className="text-[14px] text-[color:var(--muted)] mt-2">
                            {data.pazienti.length === 0 ? 'Nessun paziente per ora' : `${data.pazienti.length} ${data.pazienti.length === 1 ? 'paziente' : 'pazienti'} in archivio`}
                        </p>
                    </div>
                    {data.pazienti.length > 0 && (
                        <button onClick={() => setAdding(true)} className="vw-next" style={{ height: 48, whiteSpace: 'nowrap' }}>
                            <i className="ph-bold ph-plus"></i>
                            <span>Nuovo paziente</span>
                        </button>
                    )}
                </div>

                {data.pazienti.length > 3 && (
                    <div className="relative mb-4 rise" style={{ animationDelay: '.1s' }}>
                        <i className="ph ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none"></i>
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca per nome o numero" className="fld" style={{ paddingLeft: 40 }} />
                    </div>
                )}

                {/* Elenco */}
                <div className="stagger flex flex-col gap-2">
                    {list.map((p) => (
                        <button key={p.id} onClick={() => setSelectedPatientId(p.id)} className="patient-row group">
                            <span className="patient-avatar">
                                {p.nome.charAt(0)}
                                {p.cognome.charAt(0)}
                            </span>
                            <span className="min-w-0 flex-1 text-left">
                                <span className="block font-semibold text-[16px] text-[color:var(--ink)] truncate">
                                    {p.nome} {p.cognome}
                                </span>
                                <span className="block text-[13px] text-[color:var(--muted)] truncate">{lastVisit(p)}</span>
                            </span>
                            <span className="hidden sm:flex items-center gap-1.5 text-[13px] text-[color:var(--muted)] flex-none">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: (p.status || 'Attivo') === 'Attivo' ? 'var(--ok)' : '#B5B3AE' }}></span>
                                {p.status || 'Attivo'}
                            </span>
                            <i className="ph ph-arrow-right text-[color:var(--muted)] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[color:var(--ink)]"></i>
                        </button>
                    ))}
                    {data.pazienti.length === 0 && (
                        <div className="panel text-center py-12">
                            <p className="font-semibold text-[17px] text-[color:var(--ink)]">Inizia dal primo paziente</p>
                            <p className="text-[14px] text-[color:var(--muted)] mt-1 mb-5">Basta nome e cognome, il resto lo aggiungi quando serve.</p>
                            <button onClick={() => setAdding(true)} className="vw-next mx-auto">
                                <i className="ph-bold ph-plus"></i>
                                <span>Nuovo paziente</span>
                            </button>
                        </div>
                    )}
                    {data.pazienti.length > 0 && list.length === 0 && <p className="text-center text-[14px] text-[color:var(--muted)] py-10">Nessun risultato per "{query}"</p>}
                </div>
            </div>

            {/* Pets: in sviluppo */}
            {petsOpen && (
                <div className="sheet-back" onClick={() => setPetsOpen(false)}>
                    <div className="sheet text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="pets-mark" aria-hidden="true">
                            <i className="ph-fill ph-dog"></i>
                        </div>
                        <h2 className="text-[26px] leading-tight text-[color:var(--ink)]" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 600 }}>
                            Pets
                        </h2>
                        <p className="text-[16px] font-medium text-[color:var(--ink)] mt-2">Stessa cura, anche per chi ha quattro zampe.</p>
                        <p className="text-[14px] text-[color:var(--muted)] mt-2 leading-relaxed">
                            Stiamo sviluppando URBIOS Pets, pensato per gli animali da compagnia: schede, visite e piani alimentari per cani e gatti, con la stessa semplicità.
                        </p>
                        <span className="pets-soon pets-soon-lg">In arrivo</span>
                        <button onClick={() => setPetsOpen(false)} className="pets-close">
                            Ho capito
                        </button>
                    </div>
                </div>
            )}

            {/* Student: in arrivo, diventerà un libro */}
            {studentSoonOpen && (
                <div className="sheet-back" onClick={() => setStudentSoonOpen(false)}>
                    <div className="sheet text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="pets-mark" aria-hidden="true">
                            <i className="ph-fill ph-book-open-text"></i>
                        </div>
                        <h2 className="text-[26px] leading-tight text-[color:var(--ink)]" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 600 }}>
                            Student
                        </h2>
                        <p className="text-[16px] font-medium text-[color:var(--ink)] mt-2">Si sta trasformando in qualcosa di nuovo.</p>
                        <p className="text-[14px] text-[color:var(--muted)] mt-2 leading-relaxed">La modalità Student è in pausa mentre la rivediamo da capo: tornerà presto, in una forma più completa.</p>
                        <span className="pets-soon pets-soon-lg">In arrivo</span>
                        <button onClick={() => setStudentSoonOpen(false)} className="pets-close">
                            Ho capito
                        </button>
                    </div>
                </div>
            )}

            {/* Nuovo paziente: modulo leggero, al posto delle finestre del browser */}
            {adding && (
                <div className="sheet-back" onClick={() => setAdding(false)}>
                    <form className="sheet" onClick={(e) => e.stopPropagation()} onSubmit={submitPatient}>
                        <div className="flex items-start justify-between mb-5">
                            <div>
                                <h2 className="font-semibold text-[20px] text-[color:var(--ink)]">Nuovo paziente</h2>
                                <p className="text-[13px] text-[color:var(--muted)] mt-0.5">Il resto lo compili nell'anagrafica.</p>
                            </div>
                            <button type="button" onClick={() => setAdding(false)} className="vw-chip !px-0 w-9 !h-9 justify-center" aria-label="Chiudi">
                                <i className="ph ph-x"></i>
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="fld-label">Nome</label>
                                <input autoFocus className="fld" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                            </div>
                            <div>
                                <label className="fld-label">Cognome</label>
                                <input className="fld" value={form.cognome} onChange={(e) => setForm({ ...form, cognome: e.target.value })} />
                            </div>
                        </div>
                        <div className="mb-6">
                            <span className="fld-label">Sesso biologico</span>
                            <div className="seg">
                                {['M', 'F'].map((x) => (
                                    <button key={x} type="button" onClick={() => setForm({ ...form, sesso: x })} className={form.sesso === x ? 'on' : ''}>
                                        {x === 'M' ? 'Maschio' : 'Femmina'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button type="submit" disabled={!form.nome.trim() || !form.cognome.trim()} className="vw-next w-full disabled:opacity-40 disabled:pointer-events-none">
                            <span>Crea e apri la scheda</span>
                            <i className="ph ph-arrow-right"></i>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};
