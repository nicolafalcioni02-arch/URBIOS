import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useCompact } from '../../hooks/useCompact';
import { GROUPS as ALL_GROUPS, sectionById } from './sections';
import { Icon } from './ui/icons';
import { IconBtn } from './ui/kit';
import { UrbiosWordmark } from '../../brand/UrbiosLogo';
import './settings.css';

// Guscio delle Impostazioni: solo navigazione. Le sezioni stanno in sections.js, ogni scheda in tabs/<cartella>.
// Dal Laboratorio (scope 'lab') compaiono solo le schede che servono lì: niente studio, fatturazione, orari, formule, esportazioni di pazienti
const LAB_IDS = ['aspetto', 'sicurezza', 'cita', 'info'];

export const SettingsModal = ({ db, onUpdateDb, onClose, scope }) => {
    const GROUPS = scope === 'lab' ? ALL_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => LAB_IDS.includes(i.id)) })).filter((g) => g.items.length) : ALL_GROUPS;
    const SECTIONS = GROUPS.flatMap((g) => g.items);
    const compact = useCompact(639);
    // su telefono si parte dall'elenco (tab = null) e si entra con un tocco
    const [tab, setTab] = useState(compact ? null : SECTIONS[0].id);
    const current = sectionById(tab);
    const Body = current ? current.Component : null;
    const body = Body ? <Body key={tab} db={db} onUpdateDb={onUpdateDb} onClose={onClose} /> : null;

    if (compact)
        return ReactDOM.createPortal(
            <div className="fixed inset-0 z-[9999] m-shell m-settings slide-in-right">
                <header className="m-nav is-solid">
                    <div className="m-nav-side">
                        {tab && (
                            <button className="m-back" aria-label="Torna alle impostazioni" onClick={() => setTab(null)}>
                                <Icon name="chevronLeft" size={26} />
                            </button>
                        )}
                    </div>
                    <span className="m-nav-title is-on">{current ? current.label : 'Impostazioni'}</span>
                    <div className="m-nav-side end">
                        <button className="m-back" style={{ fontWeight: 600, paddingRight: 10 }} onClick={onClose}>
                            Fine
                        </button>
                    </div>
                </header>
                <div className="m-scroll">
                    {tab ? (
                        <div className="m-settings-body rise">{body}</div>
                    ) : (
                        <>
                            <div className="m-large rise">
                                <h1>Impostazioni</h1>
                                <p>Il tuo studio, l'app e l'archivio</p>
                            </div>
                            {GROUPS.map((g, gi) => (
                                <div key={g.label} className="rise" style={{ animationDelay: `${0.04 + gi * 0.03}s`, marginTop: 18 }}>
                                    <p className="st-side-label" style={{ padding: '0 32px 6px' }}>
                                        {g.label}
                                    </p>
                                    <div className="m-group">
                                        {g.items.map((s) => (
                                            <button key={s.id} className="m-row" onClick={() => setTab(s.id)}>
                                                <span className="st-ico">
                                                    <Icon name={s.icon} size={18} />
                                                </span>
                                                <span className="m-row-body">
                                                    <span className="m-row-text">
                                                        <span className="m-row-title">{s.label}</span>
                                                        <span className="m-row-sub">{s.sub}</span>
                                                    </span>
                                                    <Icon name="chevronRight" size={16} className="m-chev" />
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="mt-6 text-center">
                                <div className="inline-flex items-center gap-2.5 text-[color:var(--ink)]">
                                    <UrbiosWordmark size={30} />
                                        </div>
                                <p className="text-[11px] text-[color:var(--muted)] mt-2">© Software 2026</p>
                            </div>
                        </>
                    )}
                    <div style={{ height: 32 }}></div>
                </div>
            </div>,
            document.body
        );

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm md:p-4 fade-enter">
            <div className="st-shell bg-white w-full max-w-5xl h-full md:h-[85vh] md:rounded-2xl shadow-2xl flex overflow-hidden">
                <aside className="st-side w-56 lg:w-64 flex-none p-4 flex flex-col justify-between overflow-y-auto">
                    <div>
                        <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[color:var(--ink)] mb-5 px-2.5 pt-1">Impostazioni</h2>
                        <nav>
                            {GROUPS.map((g) => (
                                <div key={g.label} className="st-side-group">
                                    <p className="st-side-label">{g.label}</p>
                                    {g.items.map((s) => (
                                        <button key={s.id} onClick={() => setTab(s.id)} className={`set-side ${tab === s.id ? 'on' : ''}`} title={s.sub}>
                                            <Icon name={s.icon} size={18} />
                                            <span className="st-side-text truncate">{s.label}</span>
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </nav>
                    </div>
                    <div className="px-2.5 pt-4">
                        <div className="flex items-center gap-2.5 text-[color:var(--ink)]">
                            <UrbiosWordmark size={30} />
                        </div>
                        <p className="text-[11px] text-[color:var(--muted)] mt-2">© Software 2026</p>
                    </div>
                </aside>

                <main key={tab} className="flex-1 min-w-0 overflow-y-auto relative p-5 md:p-8">
                    <IconBtn icon="close" label="Chiudi" onClick={onClose} className="is-close absolute top-4 right-4 z-10" />
                    {body}
                </main>
            </div>
        </div>,
        document.body
    );
};
