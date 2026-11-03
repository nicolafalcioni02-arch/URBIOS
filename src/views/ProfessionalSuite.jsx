import React, { useState, useMemo } from 'react';
import { UrbiosLogo } from '../brand/UrbiosLogo';
import { SettingsModal } from './settings/SettingsModal';
import { PatientDetail } from './patientDetail/PatientDetail';
import { StudentMode } from './StudentMode';
import { useArchive } from '../storage/ArchiveProvider';
import { WidgetDock } from '../components/widgets/WidgetDock';
import { AgendaView } from './agenda/AgendaView';
import { dateKey, isActive, sameDay, startOf } from '../components/agenda/agendaLogic';
import { useCompact } from '../hooks/useCompact';
import { HomeMobile } from './home/HomeMobile';
import { MobileTabBar, ActionSheet } from '../components/mobile/MobileChrome';
import { isExample } from '../storage/example/example';
import { Research } from '../research/Research';
import { Chef } from '../chef/Chef';
import { InvoiceIcon } from '../invoices/InvoiceIcon';
import { InvoicesView } from '../invoices/InvoicesView';

// Voce della barra alta (desktop): solo icona; al passaggio si ingrandisce come sotto una lente e mostra il nome (stile .hq in index.css)
const BarBtn = ({ icon, label, note, badge, onClick, className = '' }) => (
    <button onClick={onClick} className={`home-quiet hq ${className}`} aria-label={note ? `${label} (${note})` : label}>
        <span className="hq-ico">
            {typeof icon === 'string' ? <i className={`ph ${icon}`}></i> : icon}
            {badge && <span className="hq-badge">{badge}</span>}
        </span>
        <span className="hq-text">
            <span className="hq-tip">
                <span className="hq-name">{label}</span>
                {note && <span className="hq-note">{note}</span>}
            </span>
        </span>
    </button>
);

export const ProfessionalSuite = ({ data, onUpdateDb, onSwitchArea }) => {
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [studentMode, setStudentMode] = useState(false);
    const [adding, setAdding] = useState(false);
    const [searching, setSearching] = useState(false);
    const [sq, setSq] = useState('');
    const [petsOpen, setPetsOpen] = useState(false);
    const [studentSoonOpen, setStudentSoonOpen] = useState(false);
    const [widgetsEditing, setWidgetsEditing] = useState(false);
    const [agenda, setAgenda] = useState(null); // null = chiusa, altrimenti { date, open?, newAppt? }
    const [query, setQuery] = useState('');
    const [moreOpen, setMoreOpen] = useState(false);
    const [chefMenu, setChefMenu] = useState(null); // menù da aprire entrando in Chef (dallo storico di un paziente)
    const [chef, setChef] = useState(false); // Chef URBIOS (src/chef/)
    const [invoices, setInvoices] = useState(false); // gestionale fatture (src/invoices/)
    const [research, setResearch] = useState(false); // unità Ricerca (src/research/)
    const compact = useCompact(639); // telefono: cornice da app nativa
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

    const lastVisit = (p) => (p.visite.length ? new Date(p.visite[0].data).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Nessuna visita');

    const sheets = (
        <>
        {/* Pets: in sviluppo */}
        {petsOpen && (
            <div className="sheet-back" onClick={() => setPetsOpen(false)}>
                <div className="sheet text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="pets-mark" aria-hidden="true">
                        <i className="ph-fill ph-dog"></i>
                    </div>
                    <h2 className="display text-[26px] text-[color:var(--ink)]">
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
                    <h2 className="display text-[26px] text-[color:var(--ink)]">
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

        {/* Cerca paziente */}
        {searching && (
            <div className="sheet-back" onClick={() => setSearching(false)}>
                <div className="sheet" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-[20px] text-[color:var(--ink)]">Cerca paziente</h2>
                        <button type="button" onClick={() => setSearching(false)} className="vw-chip !px-0 w-9 !h-9 justify-center" aria-label="Chiudi">
                            <i className="ph ph-x"></i>
                        </button>
                    </div>
                    <div className="relative mb-3">
                        <i className="ph ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--muted)] text-lg pointer-events-none"></i>
                        <input autoFocus value={sq} onChange={(e) => setSq(e.target.value)} placeholder="Nome, cognome o numero" className="fld" style={{ paddingLeft: 40 }} />
                    </div>
                    <div className="flex flex-col gap-2" style={{ maxHeight: 320, overflowY: 'auto' }}>
                        {sq.trim() && data.pazienti.filter((p) => `${p.nome} ${p.cognome} ${p.id}`.toLowerCase().includes(sq.trim().toLowerCase())).map((p) => (
                            <button key={p.id} onClick={() => { setSelectedPatientId(p.id); setSearching(false); setSq(''); }} className="patient-row">
                                <span className="patient-avatar">{p.nome.charAt(0)}{p.cognome.charAt(0)}</span>
                                <span className="min-w-0 flex-1 text-left">
                                    <span className="block font-semibold text-[16px] text-[color:var(--ink)] truncate">{p.nome} {p.cognome}</span>
                                    <span className="block text-[13px] text-[color:var(--muted)] truncate">
                                        {[p.dataNascita && `nato/a il ${new Date(p.dataNascita).toLocaleDateString('it-IT')}`, p.cf].filter(Boolean).join(' · ') || `N. ${p.id} · ${lastVisit(p)}`}
                                    </span>
                                </span>
                            </button>
                        ))}
                        {sq.trim() && !data.pazienti.some((p) => `${p.nome} ${p.cognome} ${p.id}`.toLowerCase().includes(sq.trim().toLowerCase())) && (
                            <p className="text-center text-[14px] text-[color:var(--muted)] py-6">Nessun risultato</p>
                        )}
                    </div>
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
        </>
    );

    // --- ROUTING ---
    if (studentMode) {
        return <StudentMode onExit={() => setStudentMode(false)} db={data} />;
    }
    if (chef) {
        return <Chef db={data} onUpdateDb={onUpdateDb} initialMenuId={chefMenu} onBack={() => { setChef(false); setChefMenu(null); }} />;
    }
    if (invoices) {
        return <InvoicesView db={data} onUpdateDb={onUpdateDb} onBack={() => setInvoices(false)} onOpenPatient={(id) => { setInvoices(false); setSelectedPatientId(id); }} />;
    }
    if (research) {
        return <Research db={data} onBack={() => setResearch(false)} />;
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
                    onBack={compact && !selectedPatient ? null : () => setAgenda(null)} // su telefono l'Agenda e' una sezione della barra in basso
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
                <PatientDetail key={selectedPatient.id} patient={selectedPatient} onBack={() => setSelectedPatientId(null)} onUpdateDb={onUpdateDb} db={data} onOpenAgenda={(o) => setAgenda({ date: dateKey(new Date()), ...o })} onOpenChef={(id) => { setChefMenu(id); setChef(true); }} />
                {agendaView}
            </>
        );
    }
    if (agenda && !compact) return agendaView;

    // --- SCHERMATA PRINCIPALE ---
    const q = query.trim().toLowerCase();
    const list = q ? data.pazienti.filter((p) => `${p.nome} ${p.cognome} ${p.id}`.toLowerCase().includes(q)) : data.pazienti;
    const todayAppts = (data.agenda || []).filter((a) => isActive(a) && sameDay(startOf(a), new Date())).length;

    // --- TELEFONO: sezioni nella barra in basso, tutto il resto nel foglio "Altro" ---
    if (compact) {
        const showSave = !ephemeral && dirty;
        const tabs = [
            { id: 'patients', label: 'Pazienti', icon: 'ph-users-three' },
            { id: 'agenda', label: 'Agenda', icon: 'ph-calendar-dots', badge: todayAppts || null },
            { id: 'more', label: 'Altro', icon: 'ph-dots-three-circle', dot: showSave ? 'var(--bad)' : null },
        ];
        const pick = (id) => {
            if (id === 'patients') setAgenda(null);
            else if (id === 'agenda') setAgenda((a) => a || { date: dateKey(new Date()) });
            else setMoreOpen(true);
        };
        return (
            <div className="m-shell">
                {agenda ? <div className="flex-1 min-h-0 overflow-hidden">{agendaView}</div> : (
                    <HomeMobile patients={data.pazienti} list={list} query={query} setQuery={setQuery} onOpen={setSelectedPatientId} onAdd={() => setAdding(true)} lastVisit={lastVisit} showSave={showSave} onSave={handleSave} />
                )}
                <MobileTabBar items={tabs} active={agenda ? 'agenda' : 'patients'} onSelect={pick} />
                {!agenda && showSettings && <SettingsModal db={data} onUpdateDb={onUpdateDb} onClose={() => setShowSettings(false)} />}
                {moreOpen && (
                    <ActionSheet
                        title="URBIOS"
                        subtitle={ephemeral ? 'Demo · nulla viene salvato' : dirty ? 'Ci sono modifiche non salvate' : 'Tutto salvato nel file'}
                        onClose={() => setMoreOpen(false)}
                        groups={[
                            [
                                ...(showSave ? [{ label: 'Salva ora', icon: 'ph-floppy-disk', onClick: handleSave }] : []),
                                { label: 'Impostazioni', icon: 'ph-gear', onClick: () => setShowSettings(true) },
                                { label: 'Ricerca', icon: 'ph-chart-line', onClick: () => setResearch(true) },
                                { label: 'Chef', icon: 'ph-chef-hat', onClick: () => setChef(true) },
                                { label: 'Contabilità', icon: <InvoiceIcon />, onClick: () => setInvoices(true) },
                                ...(onSwitchArea ? [{ label: 'Cambia area', icon: 'ph-squares-four', onClick: onSwitchArea }] : []),
                            ],
                            [
                                { label: 'Student', icon: 'ph-student', note: 'presto', onClick: () => setStudentSoonOpen(true) },
                                { label: 'Pets', icon: 'ph-dog', note: 'presto', onClick: () => setPetsOpen(true) },
                            ],
                            [{ label: 'Esci', icon: 'ph-sign-out', tone: 'danger', onClick: openExitDialog }],
                        ]}
                    />
                )}
                {sheets}
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-[var(--paper)] overflow-y-auto font-sans">
            {showSettings && <SettingsModal db={data} onUpdateDb={onUpdateDb} onClose={() => setShowSettings(false)} />}

            {/* Scrivania laterale: solo desktop largo (il componente si nasconde da solo su schermi più piccoli) */}
            <WidgetDock db={data} onUpdateDb={onUpdateDb} editing={widgetsEditing} onEditingChange={setWidgetsEditing} onOpenAgenda={(o) => setAgenda({ date: dateKey(new Date()), ...o })} />

            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 pb-24">
                {/* Barra alta: marchio a sinistra, azioni secondarie a destra */}
                <div className="home-bar flex items-center justify-between mb-8 sm:mb-12 rise">
                    <span className="inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-[0.32em] text-[color:var(--ink)]"><UrbiosLogo size={26} />URBIOS</span>
                    <div className="flex items-center gap-1">
                        {/* Student: bloccata per ora (codice intatto in StudentMode.jsx). Per riattivarla: setStudentMode(true) al posto di setStudentSoonOpen(true) */}
                        <BarBtn icon="ph-student" label="Student" note="presto" onClick={() => setStudentSoonOpen(true)} />
                        <BarBtn icon="ph-dog" label="Pets" note="presto" onClick={() => setPetsOpen(true)} />
                        <BarBtn icon="ph-chef-hat" label="Chef" onClick={() => setChef(true)} />
                        <BarBtn icon="ph-chart-line" label="Ricerca" note="anteprima" onClick={() => setResearch(true)} />
                        <BarBtn icon={<InvoiceIcon size="22px" />} label="Contabilità" onClick={() => setInvoices(true)} />
                        <BarBtn icon="ph-calendar-dots" label="Agenda" badge={todayAppts || null} onClick={() => setAgenda({ date: dateKey(new Date()) })} />
                        <BarBtn icon={widgetsEditing ? 'ph-check' : 'ph-squares-four'} label={widgetsEditing ? 'Fine' : 'Widget'} onClick={() => setWidgetsEditing((v) => !v)} className="max-[1359px]:!hidden" />
                        <BarBtn icon="ph-gear" label="Impostazioni" onClick={() => setShowSettings(true)} />
                        {!ephemeral && dirty && (
                            <button onClick={handleSave} className="home-quiet" style={{ color: 'var(--bad)' }}>
                                <i className="ph ph-floppy-disk"></i>
                                <span>Salva</span>
                            </button>
                        )}
                        {onSwitchArea && <BarBtn icon="ph-swap" label="Cambia area" onClick={onSwitchArea} />}
                        <BarBtn icon="ph-sign-out" label="Esci" onClick={openExitDialog} />
                    </div>
                </div>

                {/* Titolo e azione principale */}
                <div className="flex flex-wrap items-end justify-between gap-4 mb-5 rise" style={{ animationDelay: '.05s' }}>
                    <div className="home-title">
                        <h1 className="display text-[38px] sm:text-[48px] text-[color:var(--ink)]">
                            Pazienti
                        </h1>
                        <p className="text-[14px] text-[color:var(--muted)] mt-2">
                            {data.pazienti.length === 0 ? 'Nessun paziente per ora' : `${data.pazienti.length} ${data.pazienti.length === 1 ? 'paziente' : 'pazienti'} in archivio`}
                        </p>
                    </div>
                    {data.pazienti.length > 0 && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => { setSq(''); setSearching(true); }} className="vw-chip !px-0 justify-center" style={{ width: 48, height: 48 }} aria-label="Cerca paziente" title="Cerca paziente">
                                <i className="ph ph-magnifying-glass text-[20px]"></i>
                            </button>
                            <button onClick={() => setAdding(true)} className="vw-next" style={{ height: 48, whiteSpace: 'nowrap' }}>
                                <i className="ph-bold ph-plus"></i>
                                <span>Nuovo paziente</span>
                            </button>
                        </div>
                    )}
                </div>

                {data.pazienti.length > 3 && (
                    <div className="relative mb-4 rise" style={{ animationDelay: '.1s' }}>
                        <i className="ph ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none"></i>
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca per nome o numero" className="fld" style={{ paddingLeft: 40 }} />
                    </div>
                )}

                {/* Elenco */}
                <div className="home-list stagger flex flex-col gap-2">
                    {list.map((p) => (
                        <button key={p.id} onClick={() => setSelectedPatientId(p.id)} className="patient-row group">
                            <span className="patient-avatar">
                                {p.nome.charAt(0)}
                                {p.cognome.charAt(0)}
                            </span>
                            <span className="min-w-0 flex-1 text-left">
                                <span className="block font-semibold text-[16px] text-[color:var(--ink)] truncate">
                                    {p.nome} {p.cognome}
                                    {isExample(p) && <span className="ex-badge" title="Paziente di esempio: le modifiche non si salvano">Esempio</span>}
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

            {sheets}
        </div>
    );
};
