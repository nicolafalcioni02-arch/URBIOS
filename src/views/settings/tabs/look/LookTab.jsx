import React from 'react';
import { LOOKS, lookOf } from '../../../../looks/looks';
import { Page } from '../../ui/kit';
import { Icon } from '../../ui/icons';

// Mini anteprima disegnata con i colori dell'aspetto (niente immagini)
const Preview = ({ look }) => {
    const [bg, a, b, c] = look.swatches;
    const glass = look.id === 'vetro';
    const back = glass
        ? `radial-gradient(70% 60% at 90% 0%, ${a}cc, transparent 60%), radial-gradient(60% 60% at 0% 60%, ${b}, transparent 60%), radial-gradient(60% 50% at 70% 110%, ${c}, transparent 60%), ${bg}`
        : bg;
    const card = glass
        ? { background: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.9)', borderRadius: 14, backdropFilter: 'blur(6px)' }
        : { background: a, border: '1px solid #E6E4DE', borderRadius: 8 };
    return (
        <div style={{ background: back, height: 120, borderRadius: 16, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
            <div style={{ fontFamily: glass ? '-apple-system, BlinkMacSystemFont, Outfit, sans-serif' : 'Inter, sans-serif', fontWeight: glass ? 300 : 600, fontSize: 20, letterSpacing: '-.03em', color: '#17181B' }}>
                Pazienti
            </div>
            <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                {[0, 1, 2].map((i) => (
                    <div key={i} style={{ ...card, flex: 1, padding: 7, display: 'flex', flexDirection: glass ? 'column' : 'row', alignItems: glass ? 'flex-start' : 'center', gap: 5 }}>
                        <span style={{ width: 14, height: 14, borderRadius: 99, background: glass ? a : '#EFEEEA', flex: 'none' }} />
                        <span style={{ height: 4, width: '70%', borderRadius: 9, background: 'rgba(23,24,27,.18)', marginTop: glass ? 'auto' : 0 }} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export const LookTab = ({ tab, db, onUpdateDb }) => {
    if (tab !== 'aspetto') return null;
    const current = lookOf(db);
    const pick = (id) => onUpdateDb((prev) => ({ ...prev, aspetto: id }));

    return (
        <Page title="Aspetto" intro="Cambia solo l'aspetto delle schermate: dati, funzioni e stampe restano gli stessi. La scelta si salva nel file archivio.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {LOOKS.map((look) => {
                    const on = look.id === current;
                    return (
                        <button
                            key={look.id}
                            onClick={() => pick(look.id)}
                            className="text-left rounded-2xl p-3 transition-all"
                            style={{ background: 'var(--surface)', border: on ? '1.5px solid var(--ink)' : '1.5px solid var(--line)' }}
                        >
                            <Preview look={look} />
                            <div className="flex items-center justify-between gap-2 mt-3 px-1">
                                <div className="min-w-0">
                                    <div className="font-semibold text-[15px] text-[color:var(--ink)]">{look.name}</div>
                                    <div className="text-[12.5px] text-[color:var(--muted)] leading-snug">{look.sub}</div>
                                </div>
                                <span
                                    className="flex-none w-6 h-6 rounded-full grid place-items-center"
                                    style={{ background: on ? 'var(--ink)' : 'transparent', color: '#fff', border: on ? 'none' : '1.5px solid #CFCCC5' }}
                                >
                                    {on && <Icon name="check" size={14} stroke={2.2} />}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </Page>
    );
};
