import React, { useMemo, useState } from 'react';
import { dishNutrition, gramsOf, menuTotals } from './chefLogic';

const r0 = (x) => Math.round(x || 0).toLocaleString('it-IT');
const fmtG = (g) => (g >= 1000 ? `${(g / 1000).toLocaleString('it-IT', { maximumFractionDigits: 1 })} kg` : `${r0(g)} g`);

// Pannello di sinistra: a che punto è il menù, tempi, kcal e lista degli ingredienti per gli ospiti
export const MenuOverview = ({ menu: m, byId }) => {
    const d = useMemo(() => {
        const guests = Number(m.event?.guests) || 0;
        const dishes = m.sections.flatMap((s) => s.dishes);
        const chosen = dishes.filter((x) => byId[x.rid]);
        const empty = m.sections.filter((s) => !s.dishes.some((x) => byId[x.rid])).length;
        const blank = dishes.length - chosen.length;
        const ing = {};
        chosen.forEach((x) => byId[x.rid].items.forEach((i) => {
            const k = i.name.trim().toLowerCase();
            ing[k] = ing[k] || { name: i.name, g: 0 };
            ing[k].g += gramsOf(byId[x.rid], x, i) * (guests || 1);
        }));
        const minutes = [...new Set(chosen.map((x) => x.rid))].reduce((n, id) => n + (byId[id].minutes || 0), 0);
        const checks = [
            { ok: chosen.length > 0 && !empty && !blank, label: 'Portate complete', hint: empty ? `${empty} senza piatti` : blank ? `${blank} da scegliere` : chosen.length ? '' : 'nessun piatto' },
            { ok: guests > 0, label: 'Ospiti indicati', hint: guests ? `${guests}` : 'per le quantità' },
            { ok: Boolean(m.letter?.trim()), label: 'Lettera agli chef', hint: '' },
            { ok: (m.specials || []).length > 0, label: 'Allergie e special', hint: (m.specials || []).length ? `${m.specials.length}` : 'se servono' },
        ];
        return { guests, chosen: chosen.length, minutes, checks, tot: menuTotals(m, byId), list: Object.values(ing).sort((a, b) => b.g - a.g) };
    }, [m, byId]);
    const done = d.checks.filter((c) => c.ok).length;

    return (
        <aside className="ch-side">
            <div className="ch-sc">
                <p className="ch-sc-h">A che punto siamo</p>
                <div className="ch-prog"><i style={{ width: `${(done / d.checks.length) * 100}%` }}></i></div>
                <ul className="ch-checks">
                    {d.checks.map((c) => (
                        <li key={c.label} className={c.ok ? 'ok' : ''}>
                            <i className={`ph ${c.ok ? 'ph-check-circle' : 'ph-circle'}`}></i>
                            <span>{c.label}</span>
                            {c.hint && <small>{c.hint}</small>}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="ch-sc ch-sc-grid">
                <div><b>{d.chosen}</b><span>piatti</span></div>
                <div><b>{d.minutes ? `${d.minutes}′` : '—'}</b><span>preparazione</span></div>
                <div><b>{r0(d.tot.kcal)}</b><span>kcal a testa</span></div>
                <div><b>{d.guests || '—'}</b><span>ospiti</span></div>
            </div>
            <div className="ch-sc ch-sc-fill">
                <p className="ch-sc-h">Ingredienti{d.guests ? ` per ${d.guests} ospiti` : ' per 1 persona'}</p>
                {d.list.length === 0 ? <p className="ch-sc-e">Scegli i piatti e qui compare la lista della spesa.</p> : (
                    <ul className="ch-sc-list">
                        {d.list.map((i) => <li key={i.name}><span>{i.name}</span><b>{fmtG(i.g)}</b></li>)}
                    </ul>
                )}
            </div>
        </aside>
    );
};

// Allergeni: riconosciuti dai nomi degli ingredienti (parole chiave), come promemoria per la cucina
const ALLERGENS = [
    ['Glutine', /frument|farina|pasta|pane|pangrattato|orzo|farro|semola|couscous|biscott|crackers|birra|grano/i],
    ['Latte e lattosio', /latte|formaggio|parmigiano|mozzarella|burro|panna|yogurt|ricotta|mascarpone|pecorino|grana|gorgonzola|feta/i],
    ['Uova', /uov[oa]|albume|tuorlo|maionese/i],
    ['Pesce', /pesce|salmone|tonno|merluzzo|spigola|orata|branzino|acciug|alici|sgombro|baccal/i],
    ['Crostacei e molluschi', /gambe|scamp|aragost|granch|cozze|vongol|calamar|polpo|seppia|mazzancoll|astice/i],
    ['Frutta a guscio', /noci|nocciol|mandorl|pistacchi|anacard|pinoli/i],
    ['Arachidi e soia', /arachid|soia|tofu|edamame/i],
    ['Sedano e senape', /sedano|senape/i],
    ['Sesamo', /sesamo|tahin/i],
    ['Solfiti', /vino|aceto|spumante/i],
];

// Pannello di sinistra: strumenti del menù. Bilancio per portata, allergeni presenti nei piatti, coperti con gli special.
export const MenuTools = ({ menu: m, byId }) => {
    const d = useMemo(() => {
        const rows = m.sections.map((s) => {
            const dishes = s.dishes.filter((x) => byId[x.rid]);
            const kcal = dishes.reduce((n, x) => n + dishNutrition(byId[x.rid], x).kcal, 0);
            return { id: s.id, name: s.name, kcal, n: dishes.length };
        });
        const max = Math.max(1, ...rows.map((r) => r.kcal));
        const tot = menuTotals(m, byId);
        const kc = tot.p * 4 + tot.c * 4 + tot.f * 9;
        const macro = kc ? [['Proteine', tot.p * 4], ['Carboidrati', tot.c * 4], ['Grassi', tot.f * 9]].map(([n, v]) => [n, Math.round((v / kc) * 100)]) : [];
        const al = ALLERGENS.map(([name, re]) => {
            const dishes = [...new Set(m.sections.flatMap((s) => s.dishes).filter((x) => byId[x.rid] && byId[x.rid].items.some((i) => re.test(i.name))).map((x) => byId[x.rid].title))];
            return { name, dishes };
        }).filter((a) => a.dishes.length);
        const guests = Number(m.event?.guests) || 0;
        const special = (m.specials || []).reduce((n, x) => n + (Number(x.persons) || 0), 0);
        return { rows, max, macro, al, guests, special, standard: Math.max(0, guests - special) };
    }, [m, byId]);

    return (
        <aside className="ch-side ch-side-l">
            <div className="ch-sc">
                <p className="ch-sc-h">Bilancio per portata</p>
                {d.rows.every((r) => !r.n) ? <p className="ch-sc-e">Aggiungi i piatti per vedere le kcal di ogni portata.</p> : (
                    <ul className="ch-bars">
                        {d.rows.map((r) => (
                            <li key={r.id}><span>{r.name}</span><div><i style={{ width: `${(r.kcal / d.max) * 100}%` }}></i></div><b>{r0(r.kcal)}</b></li>
                        ))}
                    </ul>
                )}
                {d.macro.length > 0 && (
                    <div className="ch-macro">
                        {d.macro.map(([n, v]) => <span key={n}><b>{v}%</b>{n}</span>)}
                    </div>
                )}
            </div>
            <div className="ch-sc">
                <p className="ch-sc-h">Coperti</p>
                {d.guests ? (
                    <div className="ch-sc-grid">
                        <div><b>{d.standard}</b><span>menù standard</span></div>
                        <div><b>{d.special}</b><span>special e bimbi</span></div>
                    </div>
                ) : <p className="ch-sc-e">Indica gli ospiti nella scheda Evento per dividere i coperti tra menù standard e special.</p>}
            </div>
            <div className="ch-sc ch-sc-fill">
                <p className="ch-sc-h">Allergeni nei piatti</p>
                {d.al.length === 0 ? <p className="ch-sc-e">Nessun allergene riconosciuto negli ingredienti scelti.</p> : (
                    <ul className="ch-sc-list ch-al">
                        {d.al.map((a) => <li key={a.name}><span><b>{a.name}</b><small>{a.dishes.join(' · ')}</small></span></li>)}
                    </ul>
                )}
                <p className="ch-sc-e" style={{ marginTop: 8 }}>Riconosciuti dai nomi degli ingredienti: controlla sempre le etichette.</p>
            </div>
        </aside>
    );
};
