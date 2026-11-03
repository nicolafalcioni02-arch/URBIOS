import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ChartsPage } from '../../../views/analisi/ChartsReport';
import { buildBodyModel } from '../../../views/analisi/logic/bodyModel';
import { computeSomatotype } from '../../../views/analisi/logic/somatotype';
import { DOCS, docOf, oggi } from '../../patient/info/documentsLogic';
import { DOC_TYPES, PRESETS, availability, buildHtml, currentView, defaultOptions, fixedPages, hasMasthead, notebookPagesOf } from './catalog';
import { NotebookPage } from '../../../lab/print/NotebookPage';
import { cleanHtml, mergeFragments, paginateHtml } from './logic/paginate';
import { DEFAULT_THEME, MM, geometry, layoutById, loadLayoutFonts, themeKey } from './logic/theme';
import { ageAt, findVisit, fmtDate, freshPatient, sexOf } from './logic/visits';
import { CoverPage, FitBox, Sheet } from './parts/Sheet';
import { Sidebar } from './parts/Sidebar';
import { TextTools } from './parts/TextTools';
import { printCenterCss } from './printCenterStyles';
import { wordFile } from './docs/lab';
import { professionalFor } from '../../../storage/example/example';

// Safari (e ogni browser su iPhone/iPad) salva i PDF con il motore WebKit: alcuni effetti vanno semplificati in stampa
const IS_SAFARI = typeof navigator !== 'undefined' && /Apple/.test(navigator.vendor || '');

// incorporato (Laboratorio): aspetto fisso, pulito, senza intestazioni
const EMBED_THEME = { ...DEFAULT_THEME, accent: '#000000', header: 'mai' };
export const NB_FONTS = [['', 'Inter (URBIOS)'], ['Arial, Helvetica, sans-serif', 'Arial'], ['"Times New Roman", Times, serif', 'Times New Roman'], ['Georgia, serif', 'Georgia']];
const NB_SIZES = [[0.9, 'Piccolo'], [1, 'Normale'], [1.1, 'Grande'], [1.2, 'Molto grande']];
const RIGORE = { id: 'rigore', fonts: ['400 1em Inter', '600 1em Inter', '700 1em Inter'] }; // bianco e nero, un solo carattere (quello di URBIOS)

let seq = 0;
const newId = () => `d${Date.now().toString(36)}${seq++}`;

// Centro stampa: un solo posto per comporre, sistemare e stampare (o salvare in PDF) tutti i documenti del paziente.
// Ogni documento nasce dai dati, si impagina da solo in fogli A4 veri e resta modificabile direttamente sul foglio.
// chiave delle modifiche a mano salvate: stesso documento con le stesse opzioni
const editKey = (it) => `${it.type}:${JSON.stringify(it.opts || {})}`;

export const PrintCenter = ({ patient: patient0, db, onUpdateDb, readOnly = false, scope = null, draft = null, initial = null, embedded = false, bar = null, onClose }) => {
    const patient = useMemo(() => freshPatient(db, patient0), [db, patient0]);
    const prof = professionalFor(patient, db);
    const ctx = useMemo(() => ({ patient, db, prof, draft, scope }), [patient, db, prof, draft, scope]);
    const stored = db?.stampa || {};
    const canSave = !!onUpdateDb && !readOnly;

    const [theme, setThemeState] = useState(() => (embedded ? EMBED_THEME : { ...DEFAULT_THEME, ...(stored.tema || {}) }));
    const customPresets = (stored.pacchetti || []).map((p) => ({ ...p, custom: true }));
    const presets = scope === 'lab' ? [] : [...PRESETS, ...customPresets];

    const makeItem = useCallback(
        (spec) => {
            const s = typeof spec === 'string' ? { type: spec } : spec;
            const item = { id: newId(), type: s.type, on: true, edited: false, opts: defaultOptions(s.type, ctx, s) };
            if (DOC_TYPES[s.type].kind === 'flow') {
                const saved = s.html || ctx.patient.stampaModifiche?.[editKey(item)];
                if (saved) Object.assign(item, { html: saved, edited: true });
                else item.html = cleanHtml(buildHtml(item, ctx));
            }
            return item;
        },
        [ctx]
    );
    const fromTypes = (list) => list.filter((t) => DOC_TYPES[typeof t === 'string' ? t : t.type] && availability(typeof t === 'string' ? t : t.type, ctx).ok).map(makeItem);

    const [presetId, setPresetId] = useState(() => (initial ? null : stored.ultimoPacchetto || 'consegna'));
    const [items, setItems] = useState(() => {
        if (initial) return fromTypes(initial);
        if (scope === 'lab') return [];
        const p = presets.find((x) => x.id === (stored.ultimoPacchetto || 'consegna')) || PRESETS[0];
        return fromTypes(p.types);
    });

    // incorporato (anteprima del Laboratorio): se i dati cambiano, i documenti si rigenerano tenendo gli stessi id (niente sfarfallio)
    const firstRun = useRef(true);
    const initialKey = JSON.stringify(initial);
    useEffect(() => {
        if (!embedded) return;
        if (firstRun.current) { firstRun.current = false; return; }
        // con modifiche fatte a mano l'anteprima non si rigenera (le perderebbe): si ripristina dal tasto
        setItems((old) => (old.some((it) => it.edited) || dirty.current.size ? old : regen(old)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [db, initialKey]);
    const regen = (old) => fromTypes(initial || []).map((it, i) => (old[i] ? { ...it, id: old[i].id } : it));
    const rootRef = useRef(null);
    const itemsRef = useRef(items);
    itemsRef.current = items;
    const handEdited = embedded && items.some((it) => it.edited);

    const [frags, setFrags] = useState({});
    const fragCache = useRef({});
    const [busy, setBusy] = useState(false);
    const busyRef = useRef(false);
    const [activeFlow, setActiveFlow] = useState(null);
    const [sideOpen, setSideOpen] = useState(false);
    const [tab, setTab] = useState('contenuto');
    // telefono: i pannelli si aprono dalla barra in basso (raggiungibile col pollice)
    const openPanel = (t) => {
        setMenu(false);
        if (sideOpen && tab === t) setSideOpen(false);
        else {
            setTab(t);
            setSideOpen(true);
        }
    };
    const [menu, setMenu] = useState(false);
    const [toast, setToast] = useState(null);
    const [zoom, setZoom] = useState('fit');
    const [grid, setGrid] = useState(false); // vista d'insieme: tutti i fogli affiancati
    const [fitZoom, setFitZoom] = useState(1);
    const [overflow, setOverflow] = useState({});
    const [fontsRev, setFontsRev] = useState(0); // un carattere arrivato in ritardo cambia le misure: si reimpagina
    useEffect(() => {
        if (!document.fonts || !document.fonts.addEventListener) return undefined;
        const on = () => setFontsRev((n) => n + 1);
        document.fonts.addEventListener('loadingdone', on);
        return () => document.fonts.removeEventListener('loadingdone', on);
    }, []);
    const editRefs = useRef({});
    const dirty = useRef(new Set());
    const deskRef = useRef(null);
    const measureBody = useRef(null);
    const measureFlow = useRef(null);
    const pageRefs = useRef({});

    const layout = embedded ? RIGORE : layoutById(theme.layout);
    const layoutClass = `pc-l-${layout.id}`;
    const g = useMemo(() => geometry(theme), [theme]);
    const tKey = themeKey(theme);

    const flash = (msg, icon = 'ph-check-circle') => {
        setToast({ msg, icon, n: Date.now() });
    };
    useEffect(() => {
        if (!toast) return undefined;
        const t = setTimeout(() => setToast(null), 4200);
        return () => clearTimeout(t);
    }, [toast]);

    // ---- stile: si ricorda per i prossimi documenti ----
    const setTheme = (patch) => {
        setThemeState((t) => {
            const next = { ...t, ...patch };
            if (canSave) onUpdateDb((prev) => ({ ...prev, stampa: { ...(prev.stampa || {}), tema: next } }));
            return next;
        });
    };

    // ---- intestazione di pagina: dove si vede ----
    const headOn = (item, pageIdx) => {
        if (theme.header === 'mai') return false;
        if (theme.header === 'sempre') return true;
        return !(pageIdx === 0 && hasMasthead(item));
    };

    // ---- modifiche a mano: si ricuciono le pagine del documento ----
    const commit = useCallback((id) => {
        if (!dirty.current.has(id)) return;
        dirty.current.delete(id);
        const els = Object.keys(editRefs.current)
            .filter((k) => k.startsWith(`${id}:`))
            .sort((a, b) => Number(a.split(':')[1]) - Number(b.split(':')[1]))
            .map((k) => editRefs.current[k])
            .filter(Boolean);
        if (!els.length) return;
        const html = mergeFragments(els.map((el) => el.innerHTML));
        setItems((list) => list.map((it) => (it.id === id && it.html !== html ? { ...it, html, edited: true } : it)));
        setOverflow((o) => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith(`${id}:`))));
    }, []);
    const commitAll = useCallback(() => [...dirty.current].forEach(commit), [commit]);

    // ---- impaginazione (in un foglio nascosto identico a quelli visibili) ----
    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            await loadLayoutFonts(layout);
            if (document.fonts && document.fonts.ready) await document.fonts.ready;
            const todo = items.filter((it) => it.on && DOC_TYPES[it.type].kind === 'flow');
            for (const it of todo) {
                const key = `${tKey}|${theme.header}|${it.html}|${fontsRev}`;
                if (fragCache.current[it.id]?.key === key) continue;
                busyRef.current = true;
                setBusy(true);
                const hFirst = g.heightMm(headOn(it, 0)) * MM;
                const hRest = g.heightMm(headOn(it, 1)) * MM;
                const pages = await paginateHtml(it.html, { body: measureBody.current, flow: measureFlow.current, limits: (i) => (i === 0 ? hFirst : hRest) - 1, isCancelled: () => cancelled });
                if (cancelled || !pages) return;
                fragCache.current[it.id] = { key, pages };
                setFrags((f) => ({ ...f, [it.id]: pages }));
            }
            busyRef.current = false;
            setBusy(false);
        };
        run();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, tKey, theme.header, fontsRev]);

    // ---- elenco delle pagine ----
    const visible = items.filter((it) => it.on);
    const pages = [];
    visible.forEach((it) => {
        const kind = DOC_TYPES[it.type].kind;
        if (kind === 'cover') pages.push({ kind, item: it, key: `${it.id}:c` });
        else if (kind === 'notebook') notebookPagesOf(it, ctx).forEach((np, i) => pages.push({ kind, item: it, np, i, key: `${it.id}:n${i}` }));
        else if (kind === 'fixed') fixedPages(it).forEach((n, i) => pages.push({ kind, item: it, n, i, key: `${it.id}:f${n}` }));
        else {
            const f = frags[it.id];
            if (!f || fragCache.current[it.id]?.key !== `${tKey}|${theme.header}|${it.html}|${fontsRev}`) {
                // in attesa dell'impaginazione: si mostrano le pagine di prima (se ci sono) o un segnaposto
                (f || [null]).forEach((html, i) => pages.push({ kind: 'flow', item: it, i, html, stale: true, key: `${it.id}:${i}` }));
            } else f.forEach((html, i) => pages.push({ kind: 'flow', item: it, i, html, key: `${it.id}:${i}` }));
        }
    });
    const total = pages.length;
    const ranges = {};
    pages.forEach((p, idx) => {
        const r = ranges[p.item.id];
        ranges[p.item.id] = r ? [r[0], idx + 1] : [idx + 1, idx + 1];
    });
    const index = visible.filter((it) => it.type !== 'copertina' && ranges[it.id]).map((it) => ({ id: it.id, label: DOC_TYPES[it.type].label, page: ranges[it.id][0] }));

    // ---- grafici: dati della visita scelta ----
    const chartData = (item) => {
        const v = findVisit(patient, draft, item.opts?.visitId);
        if (!v) return null;
        const sesso = sexOf(patient);
        return { visitData: v.data, report: v.data, sesso, eta: ageAt(patient, v.date), model: buildBodyModel(v.data, v.data, sesso), somatoValues: computeSomatotype(v.data), date: v.date };
    };

    // ---- azioni sul contenuto ----
    const update = (fn) => {
        commitAll();
        setItems(fn);
    };
    const applyPreset = (p) => {
        const hasEdits = items.some((it) => it.edited);
        if (hasEdits && !window.confirm('Cambiando gruppo di documenti le modifiche fatte a mano andranno perse. Continuare?')) return;
        setPresetId(p.id);
        dirty.current.clear();
        setItems(fromTypes(p.types));
        if (canSave && scope !== 'lab') onUpdateDb((prev) => ({ ...prev, stampa: { ...(prev.stampa || {}), ultimoPacchetto: p.id } }));
    };
    const savePreset = (name) => {
        if (!canSave) {
            flash('Nella demo i gruppi non si salvano', 'ph-info');
            return;
        }
        const p = { id: `u${Date.now().toString(36)}`, label: name, icon: 'ph-bookmark-simple', types: items.map((it) => it.type) };
        onUpdateDb((prev) => ({ ...prev, stampa: { ...(prev.stampa || {}), pacchetti: [...((prev.stampa || {}).pacchetti || []), p] } }));
        setPresetId(p.id);
        flash(`Gruppo «${name}» salvato`);
    };
    const deletePreset = (p) => {
        if (!canSave || !window.confirm(`Eliminare il gruppo «${p.label}»?`)) return;
        onUpdateDb((prev) => ({ ...prev, stampa: { ...(prev.stampa || {}), pacchetti: ((prev.stampa || {}).pacchetti || []).filter((x) => x.id !== p.id) } }));
    };
    const toggle = (id) => update((list) => list.map((it) => (it.id === id ? { ...it, on: !it.on } : it)));
    const move = (from, to) =>
        update((list) => {
            if (to < 0 || to >= list.length) return list;
            const c = [...list];
            const [x] = c.splice(from, 1);
            c.splice(to, 0, x);
            return c;
        });
    const remove = (id) => {
        const it = items.find((x) => x.id === id);
        if (it?.edited && !window.confirm('Togliere il documento? Le modifiche fatte a mano andranno perse.')) return;
        dirty.current.delete(id);
        update((list) => list.filter((x) => x.id !== id));
    };
    const add = (type) => {
        const it = makeItem(type);
        update((list) => (type === 'copertina' ? [it, ...list] : [...list, it]));
        setPresetId(null);
        setTimeout(() => goTo(it.id), 350);
        return it.id;
    };
    // stessa visita e stesse scelte, subito dopo l'originale: per affiancare due viste dello stesso documento
    const duplicate = (id, patch = {}) => {
        const src = items.find((x) => x.id === id);
        if (!src) return null;
        const it = { ...src, id: newId(), on: true, edited: false, opts: { ...src.opts, ...patch } };
        if (DOC_TYPES[it.type].kind === 'flow') it.html = cleanHtml(buildHtml(it, ctx));
        update((list) => {
            const n = [...list];
            n.splice(list.findIndex((x) => x.id === id) + 1, 0, it);
            return n;
        });
        setPresetId(null);
        setTimeout(() => goTo(it.id), 350);
        return it.id;
    };
    const setOpts = (id, patch) => {
        const it = items.find((x) => x.id === id);
        if (!it) return;
        const next = { ...it, opts: { ...it.opts, ...patch } };
        if (DOC_TYPES[it.type].kind === 'flow') {
            if (it.edited && !window.confirm('Cambiare questa opzione rigenera il documento dai dati: le modifiche fatte a mano andranno perse. Continuare?')) return;
            next.html = cleanHtml(buildHtml(next, ctx));
            next.edited = false;
            dirty.current.delete(id);
        }
        update((list) => list.map((x) => (x.id === id ? next : x)));
    };
    const regenerate = (id) => {
        const it = items.find((x) => x.id === id);
        if (!it || !window.confirm('Ripristinare il documento dai dati? Le modifiche fatte a mano andranno perse.')) return;
        dirty.current.delete(id);
        setItems((list) => list.map((x) => (x.id === id ? { ...x, html: cleanHtml(buildHtml(x, ctx)), edited: false } : x)));
    };

    const goTo = (id) => {
        setSideOpen(false);
        const el = pageRefs.current[`${id}`];
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.remove('flash');
        void el.offsetWidth;
        el.classList.add('flash');
    };

    // ---- zoom: di base il foglio sta tutto in larghezza ----
    useLayoutEffect(() => {
        const el = deskRef.current;
        if (!el) return undefined;
        const fit = () => setFitZoom(Math.min(1, Math.max(0.3, (el.clientWidth - (el.clientWidth < 700 ? 16 : 64)) / (210 * MM))));
        fit();
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
        if (ro) ro.observe(el);
        return () => ro && ro.disconnect();
    }, []);
    const z = embedded ? 0.85 : zoom === 'fit' ? fitZoom : zoom; // incorporato: sempre A4 a grandezza vera
    const zz = grid ? Math.min(z, 0.34) : z;
    const stepZoom = (d) => setZoom(Math.min(2, Math.max(0.3, Math.round((z + d) * 10) / 10)));

    // ---- stampa / PDF ----
    const fileName = () => {
        const docs = visible.filter((it) => it.type !== 'copertina').map((it) => DOC_TYPES[it.type].label);
        const what = docs.length === 1 ? docs[0] : 'Documenti';
        return `${patient.cognome || ''} ${patient.nome || ''} - ${what} - ${new Date().toISOString().slice(0, 10)}`.trim();
    };
    const waitIdle = async () => {
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        const t0 = Date.now();
        while (busyRef.current && Date.now() - t0 < 8000) await new Promise((r) => setTimeout(r, 60));
        await new Promise((r) => setTimeout(r, 120));
    };
    // Word: il testo com'è sui fogli (con le modifiche a mano), come file .doc
    const exportWord = () => {
        commitAll();
        setTimeout(() => {
            const html = itemsRef.current.filter((it) => it.on && it.html).map((it) => it.html).join('');
            const blob = new Blob(['\ufeff', wordFile(html, undefined, theme.font)], { type: 'application/msword' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `quaderno-di-laboratorio-${new Date().toISOString().slice(0, 10)}.doc`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        }, 0);
    };
    const doPrint = async (pdf = false) => {
        setMenu(false);
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        commitAll();
        await waitIdle();
        if (!total) return;
        const old = document.title;
        document.title = fileName();
        const restore = () => {
            document.title = old;
            window.removeEventListener('afterprint', restore);
        };
        window.addEventListener('afterprint', restore);
        if (pdf) flash('Nella finestra di stampa scegli «Salva come PDF»: il nome del file è già pronto.', 'ph-file-pdf');
        // incorporato: per stampare va portato fuori dalla pagina (la stampa nasconde tutto tranne il Centro stampa)
        const el = rootRef.current;
        const home = embedded && el ? { parent: el.parentNode, next: el.nextSibling } : null;
        if (home) {
            document.body.appendChild(el);
            const back = () => {
                home.parent.insertBefore(el, home.next);
                window.removeEventListener('afterprint', back);
            };
            window.addEventListener('afterprint', back);
        }
        setTimeout(() => {
            window.print();
            setTimeout(restore, 1500);
        }, pdf ? 350 : 0);
        // la lettera stampata passa i documenti da firmare a "consegnato"
        if (canSave && visible.some((it) => it.type === 'lettera')) {
            onUpdateDb((prev) => ({
                ...prev,
                pazienti: prev.pazienti.map((p) => {
                    if (String(p.id) !== String(patient.id)) return p;
                    const all = { ...(p.documenti || {}) };
                    DOCS.forEach((d) => {
                        if (docOf(p, d.id).stato === 'da_consegnare') all[d.id] = { stato: 'consegnato', dataConsegna: oggi() };
                    });
                    return { ...p, documenti: all };
                }),
            }));
        }
    };

    const studioName = [prof.nome, prof.cognome].filter(Boolean).join(' ');
    const mailText = () => {
        const docs = visible.filter((it) => it.type !== 'copertina').map((it) => DOC_TYPES[it.type].label.toLowerCase());
        const list = docs.length > 1 ? `${docs.slice(0, -1).join(', ')} e ${docs[docs.length - 1]}` : docs[0] || 'il documento';
        return `Gentile ${patient.nome || ''},\n\nin allegato trovi ${list}.\nSe hai dubbi o domande sono a tua disposizione.\n\nUn caro saluto,\n${studioName}${prof.titolo_professionale ? `\n${prof.titolo_professionale}` : ''}`;
    };
    const sendMail = () => {
        setMenu(false);
        const subject = `${DOC_TYPES[visible.find((x) => x.type !== 'copertina')?.type]?.label || 'Documenti'} - ${fmtDate(new Date())}`;
        window.location.href = `mailto:${encodeURIComponent(patient.email || '')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailText())}`;
        flash('Ricorda di allegare il PDF appena salvato', 'ph-paperclip');
    };
    const copyText = async () => {
        setMenu(false);
        try {
            await navigator.clipboard.writeText(mailText());
            flash('Messaggio copiato: incollalo in email o WhatsApp');
        } catch (e) {
            flash('Copia non riuscita', 'ph-warning');
        }
    };

    const close = () => {
        commitAll();
        const edited = items.some((it) => it.edited) || dirty.current.size;
        if (edited) {
            if (canSave && window.confirm('Salvare le modifiche fatte a mano? Le ritroverai la prossima volta che apri questi documenti.')) {
                const mods = Object.fromEntries(items.filter((it) => it.edited && it.html).map((it) => [editKey(it), it.html]));
                onUpdateDb((prev) => ({
                    ...prev,
                    pazienti: prev.pazienti.map((p) => (String(p.id) === String(patient.id) ? { ...p, stampaModifiche: { ...(p.stampaModifiche || {}), ...mods } } : p)),
                }));
            } else if (!window.confirm('Chiudere senza salvare? Le modifiche fatte a mano andranno perse.')) return;
        }
        onClose();
    };

    // scorciatoie: Cmd/Ctrl+P stampa da qui (con le modifiche), Esc chiude i menu
    useEffect(() => {
        const onKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                doPrint();
            } else if (e.key === 'Escape') {
                if (menu) setMenu(false);
                else if (sideOpen) setSideOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    });

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const patientName = `${patient.nome || ''} ${patient.cognome || ''}`.trim();

    const renderPage = (p, idx) => {
        const it = p.item;
        const label = DOC_TYPES[it.type].label;
        const same = items.filter((x) => x.type === it.type); // stessa numerazione della barra laterale
        const view = currentView(it);
        const pageLabel = `${label}${same.length > 1 ? ` ${same.indexOf(it) + 1}` : ''}${view ? ` · ${view.label}` : ''}`;
        const num = idx + 1;
        const firstOfItem = ranges[it.id][0] === num;
        let sheet;
        if (p.kind === 'cover') {
            sheet = (
                <Sheet g={g} theme={theme} layoutClass={layoutClass} accent={theme.accent} bare prof={prof}>
                    <CoverPage item={it} patient={patient} prof={prof} index={index} />
                </Sheet>
            );
        } else if (p.kind === 'notebook') {
            sheet = (
                <Sheet g={g} theme={theme} layoutClass="pc-nb" accent="#1B1B1F" bare noBrand prof={prof}>
                    <NotebookPage page={p.np} />
                </Sheet>
            );
        } else if (p.kind === 'fixed') {
            const d = chartData(it);
            const withHead = headOn(it, p.i);
            sheet = (
                <Sheet g={g} theme={theme} layoutClass={layoutClass} accent={theme.accent} withHead={withHead} page={num} total={total} patientName={patientName} prof={prof} title={label}>
                    {d ? (
                        <FitBox key={`${tKey}|${withHead}|${it.opts.visitId}`}>
                            <ChartsPage page={p.n} patient={patient} {...d} />
                        </FitBox>
                    ) : null}
                </Sheet>
            );
        } else {
            const withHead = headOn(it, p.i);
            const k = `${it.id}:${p.i}`;
            sheet = (
                <Sheet g={g} theme={theme} layoutClass={`${layoutClass} ${overflow[k] ? 'overflow' : ''}`} accent={theme.accent} withHead={withHead} page={num} total={total} patientName={patientName} prof={prof} title={label}>
                    {p.html === null ? (
                        <div className="pc-skeleton">Impagino…</div>
                    ) : (
                        <div
                            className="pc-flow"
                            contentEditable={!p.stale}
                            suppressContentEditableWarning
                            spellCheck={false}
                            ref={(el) => {
                                if (el) editRefs.current[k] = el;
                                else delete editRefs.current[k];
                            }}
                            onFocus={() => setActiveFlow(it.id)}
                            onInput={(e) => {
                                dirty.current.add(it.id);
                                const body = e.currentTarget.parentElement;
                                const over = e.currentTarget.scrollHeight * (theme.scale || 1) > body.clientHeight + 2;
                                if (!!overflow[k] !== over) setOverflow((o) => ({ ...o, [k]: over }));
                            }}
                            onBlur={(e) => {
                                setActiveFlow(null);
                                // i pulsanti della barra e il cambio di finestra non chiudono la modifica
                                if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.pc-tools')) return;
                                if (!document.hasFocus()) return;
                                commit(it.id);
                            }}
                            dangerouslySetInnerHTML={{ __html: p.html }}
                        />
                    )}
                </Sheet>
            );
        }
        return (
            <div
                key={p.key}
                className="pc-pagewrap"
                onClick={
                    grid
                        ? (e) => {
                              const el = e.currentTarget;
                              setGrid(false);
                              setTimeout(() => el.scrollIntoView({ block: 'start' }), 30);
                          }
                        : undefined
                }
                ref={(el) => {
                    if (firstOfItem) {
                        if (el) pageRefs.current[it.id] = el;
                    }
                }}
            >
                <div className="pc-pagelabel" style={IS_SAFARI && grid ? { fontSize: 30 * zz, top: -46 * zz } : undefined}>
                    <span>{pageLabel}</span>
                    <span>
                        {num} / {total}
                    </span>
                </div>
                {IS_SAFARI ? (
                    <div className="pc-zfit" style={{ width: 210 * MM * zz, height: 297 * MM * zz }}>
                        <div className="pc-zfit-in" style={{ transform: `scale(${zz})`, transformOrigin: '0 0', width: 210 * MM, height: 297 * MM }}>{sheet}</div>
                    </div>
                ) : (
                    sheet
                )}
            </div>
        );
    };

    const ui = (
        <div ref={rootRef} className={`pc-overlay${IS_SAFARI ? ' pc-safari' : ''}${scope === 'lab' ? ' pc-lab' : ''}${embedded ? ' pc-embedded' : ''}`} style={{ '--accent-ui': theme.accent }}>
            <style>{printCenterCss}</style>

            <div className="pc-top">
                {embedded && bar}
                {!embedded && (
                    <button className="pc-ic pc-side-toggle" onClick={() => setSideOpen((o) => !o)} aria-label="Contenuto e stile">
                        <i className="ph ph-sidebar-simple"></i>
                    </button>
                )}
                <div className="pc-brand">
                    <div style={{ minWidth: 0 }}>
                        <h1>Centro stampa</h1>
                        <small>{patientName}</small>
                    </div>
                </div>
                <span className="pc-spacer" />
                <span className="pc-count">
                    {busy && <span className="pc-busy" aria-hidden="true" />}
                    {busy ? 'Impagino…' : `${total} ${total === 1 ? 'foglio' : 'fogli'} A4`}
                </span>
                {handEdited && (
                    <button className="pc-btn" onClick={() => { dirty.current.clear(); setItems(regen); }} title="Scarta le modifiche a mano e riparti dai dati">
                        <i className="ph ph-arrow-counter-clockwise"></i>
                        <span className="lbl">Ripristina dai dati</span>
                    </button>
                )}
                <div className="pc-zoom">
                    <button onClick={() => setGrid((v) => !v)} aria-label="Vista d'insieme" title={grid ? 'Torna alla lettura' : "Vista d'insieme: tutti i fogli affiancati"} style={grid ? { background: '#fff' } : null}>
                        <i className={`ph ${grid ? 'ph-rows' : 'ph-squares-four'}`}></i>
                    </button>
                    <button onClick={() => stepZoom(-0.1)} aria-label="Riduci">
                        <i className="ph ph-minus"></i>
                    </button>
                    <span onClick={() => setZoom('fit')} title="Adatta alla finestra">
                        {Math.round((grid ? Math.min(z, 0.34) : z) * 100)}%
                    </span>
                    <button onClick={() => stepZoom(0.1)} aria-label="Ingrandisci">
                        <i className="ph ph-plus"></i>
                    </button>
                </div>
                {embedded && (
                    <span className="pc-fontset">
                        <select value={theme.scale} onChange={(e) => setTheme({ scale: Number(e.target.value) })} aria-label="Dimensione del testo" title="Dimensione del testo">
                            {NB_SIZES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </span>
                )}
                {embedded ? (
                    <button className="pc-btn" onClick={exportWord} disabled={!total} title="Scarica il quaderno come documento Word">
                        <i className="ph ph-file-doc"></i>
                        <span className="lbl">Word</span>
                    </button>
                ) : (
                    <div style={{ position: 'relative' }}>
                        <button className="pc-btn" onClick={() => setMenu((m) => !m)} disabled={!total}>
                            <i className="ph ph-paper-plane-tilt"></i>
                            <span className="lbl">PDF e invio</span>
                            <i className="ph ph-caret-down" style={{ fontSize: 13 }}></i>
                        </button>
                    </div>
                )}
                <button className="pc-btn primary" onClick={() => doPrint(false)} disabled={!total}>
                    <i className="ph ph-printer"></i>
                    <span className="lbl">Stampa</span>
                </button>
                {!embedded && (
                    <button className="pc-ic" onClick={close} aria-label="Chiudi il Centro stampa" title="Chiudi">
                        <i className="ph ph-x"></i>
                    </button>
                )}
            </div>

            {menu && total > 0 && (
                <div className="pc-menu" role="menu">
                    <button onClick={() => doPrint(true)}>
                        <i className="ph ph-file-pdf"></i>
                        <span>
                            <b>Salva come PDF</b>
                            <small>Un unico file, già con il nome del paziente</small>
                        </span>
                    </button>
                    <button onClick={sendMail}>
                        <i className="ph ph-envelope-simple"></i>
                        <span>
                            <b>Scrivi al paziente</b>
                            <small>{patient.email ? `Apre l'email per ${patient.email} con il messaggio pronto` : "Apre l'email con il messaggio pronto (manca l'indirizzo in anagrafica)"}</small>
                        </span>
                    </button>
                    <button onClick={copyText}>
                        <i className="ph ph-copy"></i>
                        <span>
                            <b>Copia il messaggio</b>
                            <small>Per WhatsApp o un'altra app</small>
                        </span>
                    </button>
                </div>
            )}

            {!embedded && <TextTools active={!!activeFlow} />}

            <div className="pc-main" onClick={() => menu && setMenu(false)}>
                {!embedded && <Sidebar
                    open={sideOpen}
                    items={items}
                    ctx={ctx}
                    theme={theme}
                    setTheme={setTheme}
                    presets={presets}
                    presetId={presetId}
                    onPreset={applyPreset}
                    onSavePreset={savePreset}
                    onDeletePreset={deletePreset}
                    onToggle={toggle}
                    onMove={move}
                    onRemove={remove}
                    onAdd={add}
                    onDuplicate={duplicate}
                    onSetOpts={setOpts}
                    onRegenerate={regenerate}
                    ranges={ranges}
                    onGoTo={goTo}
                    tab={tab}
                    setTab={setTab}
                />}
                <div className="pc-desk" ref={deskRef}>
                    {total > 0 ? (
                        <div className={`pc-pages ${grid ? 'grid' : ''}`} style={IS_SAFARI ? undefined : { zoom: zz }}>
                            {pages.map(renderPage)}
                        </div>
                    ) : (
                        <div className="pc-desk-empty">
                            <i className="ph ph-files"></i>
                            <h3>Nessun foglio</h3>
                            <p>Scegli cosa stampare dal pannello Contenuto.</p>
                        </div>
                    )}
                </div>
                {toast && (
                    <div className="pc-toast" key={toast.n}>
                        <i className={`ph ${toast.icon}`}></i>
                        {toast.msg}
                    </div>
                )}
            </div>


            <nav className="pc-bar" aria-label="Azioni">
                <button className={sideOpen && tab === 'contenuto' ? 'on' : ''} onClick={() => openPanel('contenuto')}>
                    <i className="ph ph-files"></i>
                    <span>Documenti</span>
                </button>
                <button className={sideOpen && tab === 'stile' ? 'on' : ''} onClick={() => openPanel('stile')}>
                    <i className="ph ph-palette"></i>
                    <span>Aspetto</span>
                </button>
                <button className="pc-bar-more" onClick={() => { setSideOpen(false); setMenu((m) => !m); }} disabled={!total} aria-label="PDF e invio">
                    <i className="ph ph-share-network"></i>
                </button>
                <button className="pc-bar-print" onClick={() => doPrint(false)} disabled={!total}>
                    <i className="ph ph-printer"></i> Stampa
                </button>
            </nav>

            {/* foglio di misura: stessa larghezza, caratteri e layout dei fogli veri */}
            <div className={`pc-theme pc-measure ${layoutClass}`} style={{ '--accent': theme.accent, '--pc-scale': theme.scale, '--pc-font': theme.font || undefined, width: `${g.contentW}mm` }} aria-hidden="true">
                <div className="pc-body" ref={measureBody}>
                    <div className="pc-flow" ref={measureFlow} />
                </div>
            </div>
        </div>
    );
    return embedded ? ui : ReactDOM.createPortal(ui, document.body);
};
