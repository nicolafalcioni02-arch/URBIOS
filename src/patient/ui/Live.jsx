import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './bits.jsx';
import { UrbiosLogo } from '../../brand/UrbiosLogo.jsx';
import { Clamp } from './Clamp.jsx';
import { shareSummary } from './summaryPdf.js';
import { arr, mmss, parseSets, parseRest, sessionKey, suggestLoad, fmtDay, fmtKg, ymd, workoutSummary, sessionDate, HYPE_END } from './logic.js';

// Allenamento guidato, un esercizio alla volta. Ogni serie fatta (carico, RPE, nota) si salva SUBITO sul telefono, anche senza rete.
// Non c'è video né calorie consumate: non fanno parte di ciò che il professionista invia. Il diario resta qui.
const buzz = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch { /* non disponibile */ } };
const RPES = [6, 7, 8, 9, 10];
// sfumatura graduale ai bordi della lista che scorre: cresce con lo scorrimento (alto) e con ciò che resta da vedere (basso)
const fadeSet = (el) => { if (!el) return; const top = Math.min(48, el.scrollTop * 1.6), bot = Math.min(48, Math.max(0, el.scrollHeight - el.clientHeight - el.scrollTop) * 1.6); el.style.setProperty('--ft', top + 'px'); el.style.setProperty('--fb', bot + 'px'); };
// «3-1-2-1», «3010», «3/1/X/0» → quattro tempi (giù, fermo, su, fermo); non riconosciuto → null
const parseTempo = (s) => {
    const v = String(s || '').trim(); if (!v) return null;
    const a = /[^0-9xX]/.test(v) ? v.split(/[^0-9xX]+/).filter(Boolean) : v.split('');
    return a.length === 4 ? a.map((x) => x.toUpperCase()) : null;
};
const TEMPO = ['Giù', 'Fermo', 'Su', 'Fermo'];
// serie consecutive con stesso carico e stesso RPE → una voce sola («3 × 50 kg · RPE 8»)
const groupSets = (sets) => sets.reduce((o, x) => { const l = o[o.length - 1]; if (l && l.kg === x.kg && (l.rpe || 0) === (x.rpe || 0) && (l.reps || 0) === (x.reps || 0)) l.n += 1; else o.push({ n: 1, kg: x.kg, rpe: x.rpe, reps: x.reps }); return o; }, []);

const CountUp = ({ n }) => {
    const [v, setV] = useState(0);
    useEffect(() => { let raf, t0; const f = (t) => { t0 = t0 || t; const p = Math.min(1, (t - t0) / 1200); setV(Math.round(n * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf); }, [n]);
    return <b>{String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</b>;
};

export const Live = ({ rt, id, w, d, onExit }) => {
    // barra di stato del telefono scura come lo schermo (altrimenti resta una fascia lilla in alto)
    useEffect(() => { const m = document.querySelector('meta[name="theme-color"]'); if (!m) return undefined; const old = m.getAttribute('content'); m.setAttribute('content', '#0B0C0E'); return () => m.setAttribute('content', old); }, []);
    const doc = rt.docs.get(id), wk = arr(doc && doc.body && doc.body.settimane)[w], day = arr(wk && wk.giorni)[d];
    const list = useMemo(() => arr(day && day.esercizi).map((e) => {
        const s = parseSets(e.serie);
        return { name: e.nome, n: s.n, reps: s.reps, rest: parseRest(e.rec), kg0: parseFloat(String(e.carico).replace(',', '.')) || 0, note: e.note, rpe: e.rpe, tempo: e.tempo, pct: e.pct, ss: e.ss };
    }), [day]);
    const sDate = useRef(sessionDate(rt.log.get(), id, w, d, day)).current;   // fissata all'apertura: la chiave non salta a metà seduta
    const key = sessionKey(id, w, d, sDate);
    const sugOf = (i) => (list[i] ? suggestLoad(rt.log.get().hist, list[i].name, list[i].kg0) : null);
    const kgOf = (i) => { const s = sugOf(i); return s ? s.kg : (list[i] ? list[i].kg0 : 0); };
    const doneOf = (i) => ((rt.log.get().sessions[key] || {}).sets || {})[i] || [];
    const start = useMemo(() => {                       // riprende da dove avevi lasciato (anche se hai saltato esercizi), altrimenti dalla prima serie non fatta
        const all = list.every((e, i) => doneOf(i).length >= e.n); if (all) return { ex: 0, set: 0, fresh: true };
        const sess = rt.log.get().sessions[key] || {}, p = sess.pos;
        if (p && list[p.ex]) return { ex: p.ex, set: Math.min(doneOf(p.ex).length, list[p.ex].n - 1), secs: sess.secs || 0 };
        for (let i = 0; i < list.length; i++) if (doneOf(i).length < list[i].n) return { ex: i, set: doneOf(i).length, secs: sess.secs || 0 };
        return { ex: 0, set: 0, fresh: true };
    }, []);
    const [ex, setEx] = useState(start.ex), [setNo, setSetNo] = useState(start.set), [phase, setPhase] = useState('work');
    const [rest, setRest] = useState(0), [setSecs, setSetSecs] = useState(0), [elapsed, setElapsed] = useState(start.secs || 0);
    const [paused, setPaused] = useState(false), [listOpen, setListOpen] = useState(false), [fin, setFin] = useState(false), [kg, setKg] = useState(() => kgOf(start.ex));
    const [rpe, setRpe] = useState(null), [note, setNote] = useState(''), [tab, setTab] = useState('oggi');
    const [hype, setHype] = useState(null);
    const [sumBusy, setSumBusy] = useState(false), [sumMsg, setSumMsg] = useState('');
    useEffect(() => { if (!hype) return undefined; const t = setTimeout(() => setHype(null), 3200); return () => clearTimeout(t); }, [hype]);
    const [lastRpe, setLastRpe] = useState(null);                 // RPE della serie appena fatta (si cambia durante il riposo)
    const total = useRef(0), ac = useRef(null), lastSet = useRef(null);
    // tempi dall'orologio (non da incrementi: con lo schermo spento il timer non si ferma). run = secondi accumulati prima di runAt; restEnd 0 = non in riposo
    const T = useRef({ run: start.secs || 0, runAt: Date.now(), setAt: Date.now(), restEnd: 0, lastBeep: null, pausedAt: 0 });
    useEffect(() => { if (start.fresh) rt.log.update((l) => { delete l.sessions[key]; }); }, []);

    const beep = (f = 880, ms = 120) => {
        try {
            const A = window.AudioContext || window.webkitAudioContext; if (!A) return;
            const c = ac.current || (ac.current = new A()); if (c.state === 'suspended') c.resume();
            const o = c.createOscillator(), g = c.createGain();
            o.frequency.value = f; g.gain.value = 0.15; o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + ms / 1000);
        } catch { /* audio non disponibile */ }
    };
    useEffect(() => {
        if (paused || fin) return undefined;
        const t = T.current;
        if (t.pausedAt) { const d = Date.now() - t.pausedAt; t.runAt += d; t.setAt += d; if (t.restEnd) t.restEnd += d; t.pausedAt = 0; }   // il tempo in pausa non conta
        const tick = () => {
            const now = Date.now();
            setElapsed(t.run + Math.floor((now - t.runAt) / 1000));
            if (t.restEnd) {
                const r = Math.ceil((t.restEnd - now) / 1000);
                if (r <= 0) {                                   // la serie successiva parte da quando il riposo è finito
                    const end = t.restEnd; t.restEnd = 0; t.setAt = end; t.lastBeep = null;
                    if (now - end < 2000) { beep(1040, 260); buzz([120, 60, 120]); }
                    setPhase('work'); setRest(0); setRpe(null); setSetSecs(Math.floor((now - end) / 1000));
                } else { setRest(r); if (r <= 3 && t.lastBeep !== r) { t.lastBeep = r; beep(660); buzz(40); } }
            } else setSetSecs(Math.floor((now - t.setAt) / 1000));
        };
        const iv = setInterval(tick, 250), vis = () => { if (document.visibilityState === 'visible') tick(); };
        document.addEventListener('visibilitychange', vis);
        return () => { clearInterval(iv); document.removeEventListener('visibilitychange', vis); t.pausedAt = Date.now(); };
    }, [paused, fin]);
    // schermo acceso durante l'allenamento (se il telefono non lo permette non succede nulla); il sistema lo rilascia in secondo piano, lo richiedo al ritorno
    useEffect(() => {
        if (paused || fin) return undefined;
        let lock = null, dead = false;
        const get = async () => { try { if (!navigator.wakeLock || document.visibilityState !== 'visible') return; const l = await navigator.wakeLock.request('screen'); if (dead) { l.release().catch(() => {}); return; } lock = l; } catch { /* non disponibile */ } };
        const vis = () => { if (document.visibilityState === 'visible' && (!lock || lock.released)) get(); };
        get(); document.addEventListener('visibilitychange', vis);
        return () => { dead = true; document.removeEventListener('visibilitychange', vis); try { lock && lock.release().catch(() => {}); } catch { /* ok */ } };
    }, [paused, fin]);
    useEffect(() => () => { try { ac.current && ac.current.close(); } catch { /* ok */ } }, []);

    if (!list.length) return null;
    const cur = list[Math.min(ex, list.length - 1)];
    const sug = sugOf(ex), past = arr(rt.log.get().hist[cur.name]).slice(-4).reverse();
    const goto = (i, s) => { rt.log.update((l) => { const q = l.sessions[key] || (l.sessions[key] = { sets: {}, started: Date.now() }); q.pos = { ex: i }; q.secs = elapsed; }); setEx(i); setSetNo(s); setKg(kgOf(i)); setRpe(null); setNote(''); setPhase('work'); setSetSecs(0); setRest(0); setTab('oggi'); T.current.restEnd = 0; T.current.setAt = Date.now(); T.current.lastBeep = null; };
    const prev = () => { if (ex > 0) goto(ex - 1, Math.min(doneOf(ex - 1).length, list[ex - 1].n - 1)); };
    const nextEx = (i) => { if (i + 1 < list.length) { goto(i + 1, Math.min(doneOf(i + 1).length, list[i + 1].n - 1)); return true; } return false; };
    const complete = () => {
        if (!ac.current) beep(1, 1);                      // il primo tocco sblocca l'audio
        const exI = ex, rec = { kg, ...(rpe ? { rpe } : {}), ...(note.trim() ? { note: note.trim().slice(0, 200) } : {}) }, secs = elapsed, date = ymd();
        rt.log.update((l) => {
            const s = l.sessions[key] || (l.sessions[key] = { sets: {}, started: Date.now() });
            (s.sets[exI] = s.sets[exI] || []).push(rec); s.secs = secs; l.last[cur.name] = kg;
            const h = l.hist[cur.name] || (l.hist[cur.name] = []); let t = h.find((x) => x.date === date); if (!t) { t = { date, sets: [] }; h.push(t); }
            t.sets.push(rec); if (h.length > 12) h.splice(0, h.length - 12);
        });
        total.current += 1; buzz(30); beep(740, 90);
        setNote(''); setLastRpe(rec.rpe || null); lastSet.current = { exI, name: cur.name, date }; setTab('oggi');
        let more = true;
        if (setNo + 1 < cur.n) setSetNo(setNo + 1); else more = nextEx(ex);
        if (!more) { setFin(true); buzz([80, 50, 80, 50, 200]); return; }
        setPhase('rest'); setRest(cur.rest); T.current.restEnd = Date.now() + cur.rest * 1000; T.current.lastBeep = null;
    };
    const skipRest = () => { setPhase('work'); setRest(0); setSetSecs(0); setRpe(null); T.current.restEnd = 0; T.current.setAt = Date.now(); T.current.lastBeep = null; };
    // in riposo l'RPE riguarda la serie appena fatta: si scrive subito nel diario (voce di sessione e voce di storico, che nell'app vera sono oggetti diversi)
    const pickRpe = (r) => {
        const L = lastSet.current;
        if (phase !== 'rest' || !L) { setRpe(rpe === r ? null : r); return; }
        const v = lastRpe === r ? null : r, put = (x) => { if (x) { if (v) x.rpe = v; else delete x.rpe; } };
        rt.log.update((l) => { const a = ((l.sessions[key] || {}).sets || {})[L.exI]; put(a && a[a.length - 1]); const h = arr(l.hist[L.name]).find((x) => x.date === L.date); put(h && h.sets[h.sets.length - 1]); });
        setLastRpe(v);
    };
    const skipEx = () => { setPaused(false); if (!nextEx(ex)) setFin(true); };

    const sendSummary = async () => {
        if (sumBusy) return; setSumBusy(true); setSumMsg('');
        try { const r = await shareSummary(rt); setSumMsg(r === 'saved' ? 'PDF salvato nei file' : r === 'shared' ? 'Riassunto inviato' : ''); } catch (e) { setSumMsg('Non sono riuscito a creare il PDF'); }
        setSumBusy(false);
    };
    if (fin) {
        const sm = workoutSummary(rt.log.get(), id, w, d, list, sDate), diff = sm.prevVol != null ? sm.vol - sm.prevVol : null;
        const msg = HYPE_END[(sm.vol + sm.sets) % HYPE_END.length];
        return (
            <div className="pt-live pt-win">
                <div className="pt-win-b"><Icon name="check" size={44} /></div>
                <h1>Allenamento completato!</h1>
                <div className="pt-win-v"><CountUp n={sm.vol} /><small>kg sollevati</small></div>
                {diff !== null && diff !== 0 && <span className={'pt-win-d' + (diff > 0 ? ' is-up' : '')}>{diff > 0 ? '+' : ''}{diff} kg rispetto all'ultima volta</span>}
                <div className="pt-win-g"><div><b>{sm.sets}</b><span>serie</span></div><div><b>{Math.max(1, Math.round(elapsed / 60))}</b><span>minuti</span></div><div><b>{list.length}</b><span>esercizi</span></div></div>
                {sm.records.slice(0, 2).map((r) => <span key={r.name} className="pt-win-r">Nuovo record: {r.name}, {r.kg} kg</span>)}
                <p>{msg}</p>
                <button type="button" className="pt-cta" onClick={() => onExit(true)}>Torna alla dashboard</button>
                <button type="button" className="pt-win-sum" disabled={sumBusy} onClick={sendSummary}>{sumBusy ? 'Creo il PDF…' : sumMsg || 'Invia il riassunto'}</button>
            </div>
        );
    }
    const bars = Math.min(cur.n, 8), logged = doneOf(ex).length;
    const shownRpe = phase === 'rest' ? lastRpe : rpe;
    const shown = phase === 'rest' ? mmss(rest) : mmss(setSecs);
    const pro = [wk && wk.nota && ['Settimana', wk.nota], day && day.nota && ['Giornata', day.nota], cur.note && ['Esercizio', cur.note]].filter(Boolean);
    const mine = arr(rt.log.get().hist[cur.name]).flatMap((h) => arr(h.sets).filter((x) => x.note).map((x) => ({ date: h.date, text: x.note }))).reverse().slice(0, 8);
    const tempo = parseTempo(cur.tempo);
    const lastT = arr(rt.log.get().hist[cur.name]).filter((h) => h.date !== ymd() && arr(h.sets).length).slice(-1)[0];   // ultima seduta passata: la data fa da etichetta
    const lastG = lastT ? groupSets(lastT.sets) : [];
    const nx = list[ex], nextCard = nx ? (
        <div className="pt-nx"><span className="pt-nx-i"><Icon name="arrow" size={20} /></span><span className="pt-nx-t"><small>Dopo</small><b>{nx.name}</b></span><span className="pt-nx-s">{Math.min(setNo + 1, nx.n)}<i>/{nx.n}</i></span></div>
    ) : null;
    return (
        <div className={'pt-live' + (tempo ? ' has-tempo' : '')}>
            {hype && <div className="pt-hype" role="status" onClick={() => setHype(null)}>{hype}</div>}
            <div className="pt-live-bg">
                <Clamp as="b" lines={3} title="Esercizio" text={(cur.ss ? cur.ss + ' · ' : '') + cur.name} className={'pt-live-ex' + (cur.name && cur.name.length > 44 ? ' is-xl' : cur.name && cur.name.length > 26 ? ' is-long' : '')} />
                {tempo && phase !== 'rest' && <div className="pt-tp" aria-label="Tempi in secondi">{tempo.map((x, i) => <span key={i}><b>{x}{x !== 'X' ? <i> sec</i> : null}</b><small>{TEMPO[i]}</small></span>)}</div>}
                {phase === 'rest' && nextCard}
                {phase !== 'rest' && <div className="pt-live-row"><span className="pt-live-chips">{[`${cur.n} serie × ${cur.reps || '–'} ripetizioni`].map((t) => <u key={t}>{t}</u>)}</span>
                <span className="pt-live-dots" aria-label={`Serie ${Math.min(setNo + 1, cur.n)} di ${cur.n}`}>{Array.from({ length: Math.min(cur.n, 12) }, (_, i) => <i key={i} className={i < logged ? 'done' : i === Math.min(setNo, cur.n - 1) ? 'cur' : ''} />)}</span></div>}
                
            </div>
            <div className="pt-live-top">
                <div className="pt-lp" aria-label={`Esercizio ${ex + 1} di ${list.length}`}>{list.map((_, i) => <i key={i} className={i < ex ? 'done' : i === ex ? 'cur' : ''} />)}</div>
                <button type="button" className="pt-pause" aria-label="Esercizi" onClick={() => setListOpen(true)}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" /></svg></button>
                <button type="button" className="pt-pause" aria-label="Pausa" onClick={() => setPaused(true)}><Icon name="pause" size={22} /></button>
            </div>
            <section className="pt-sheet is-tall">
                <svg className="pt-sw" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40V36Q0 26 18 26H62C118 26 132 12 200 12S282 26 338 26H382Q400 26 400 36V40Z" fill="#fff" /></svg>
                <div className="pt-grid">
                    <div><b>{mmss(elapsed)}</b></div>
                    <div className={'pt-big' + (phase === 'rest' ? ' is-rest' : '')}><b>{shown}</b></div>
                    <div><b>{Math.min(setNo + 1, cur.n)}/{cur.n}</b></div>
                </div>
                <div className="pt-seg" role="tablist">
                    {[['oggi', 'Oggi'], ['storia', 'Storico'], ['note', pro.length ? 'Note ●' : 'Note']].map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}>{l}</button>)}
                </div>
                <div className={'pt-sheet-body' + (tab !== 'oggi' ? ' is-under' : '')} key={tab} ref={fadeSet} onScroll={(e) => fadeSet(e.currentTarget)}>
                    {tab === 'oggi' && (
                        <>
                            {lastT && <p className="pt-lastrow"><span>{String(lastT.date).split('-').reverse().slice(0, 2).join('/')}</span>{lastG.slice(0, 2).map((g, i) => <b key={i}> · {g.n} × {fmtKg(g.kg)} kg{g.rpe ? ` · RPE ${g.rpe}` : ''}</b>)}{lastG.length > 2 ? ' …' : ''}</p>}
                            {sug && sug.kg !== kg && <div className="pt-sug"><div><span>Suggerito</span><b>{fmtKg(sug.kg)} kg</b></div><button type="button" onClick={() => setKg(sug.kg)}>Usa</button></div>}
                            <span className="pt-fl">RPE</span>
                            <div className="pt-rpe">{RPES.map((r) => <button key={r} type="button" className={shownRpe === r ? 'is-on' : ''} aria-pressed={shownRpe === r} onClick={() => pickRpe(r)}>{r}</button>)}</div>
                            
                        </>
                    )}
                    {tab === 'storia' && (past.length ? past.map((h, hi) => (
                        <div className="pt-past" key={h.date + "-" + hi}>
                            <b className="pt-past-d">{String(h.date).split("-").reverse().join("/")}</b>
                            <div className="pt-past-b">
                            <div className="pt-past-s">{groupSets(h.sets).map((g, i) => <u key={i}>{g.n > 1 ? <b>{g.n} serie</b> : null}{fmtKg(g.kg)}<small>kg</small>{g.reps ? <s>× {g.reps} rep</s> : null}{g.rpe ? <i>RPE {g.rpe}</i> : null}</u>)}</div>
                            </div>
                        </div>
                    )) : <p className="pt-muted">–</p>)}
                    {tab === 'note' && <>
                        {pro.map(([, t], i) => <div className="pt-pn" key={i}>{t}</div>)}
                        <label className="pt-nw"><span className="pt-nw-i"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg></span><textarea rows="2" value={note} maxLength={200} placeholder="Scrivi una nota" onChange={(e) => setNote(e.target.value)} /></label>
                        
                        <div style={{ height: 12 }} />
                        {mine.map((n, i) => <div className="pt-past" key={'m' + i}><b className="pt-past-d">{String(n.date).split('-').reverse().join('/')}</b><span>{n.text}</span></div>)}
                    </>}
                </div>
                <div className="pt-live-act">
                    {tab === 'oggi' && <div className="pt-step" aria-label="Carico">
                        <button type="button" aria-label="Meno carico" onClick={() => setKg((x) => Math.max(0, +(x - 2.5).toFixed(1)))}><Icon name="minus" size={22} /></button>
                        <b>{cur.kg0 === 0 && kg === 0 ? 'Corpo libero' : `${fmtKg(kg)} kg`}</b>
                        <button type="button" aria-label="Più carico" onClick={() => setKg((x) => +(x + 2.5).toFixed(1))}><Icon name="plus" size={22} /></button>
                    </div>}
                    {phase === 'rest' ? <button type="button" className="pt-done is-sec" onClick={skipRest}>SALTA RIPOSO</button> : <button type="button" className="pt-done" onClick={complete}>SERIE COMPLETATA</button>}
                </div>
                <div className="pt-nav2">
                    <button type="button" disabled={ex === 0} onClick={prev}>Indietro</button>
                    <button type="button" onClick={skipEx}>Salta</button>
                </div>
            </section>
            {phase === 'rest' && rest > 0 && rest <= 10 && !paused && (
                <div className="pt-rf" role="timer" aria-label="Fine riposo">
                    <UrbiosLogo size={40} className="pt-rf-logo" />
                    <b className="pt-rf-t">{mmss(rest)}</b>
                    {nextCard}
                    <button type="button" className="pt-rf-b" onClick={skipRest}>SALTA RIPOSO</button>
                </div>
            )}
            {listOpen && (
                <div className="pt-lst-ov" role="dialog" aria-modal="true" aria-label="Esercizi" onClick={() => setListOpen(false)}>
                    <div className="pt-lst" onClick={(e) => e.stopPropagation()}>
                        <div className="pt-lst-h"><b>Esercizi</b><button type="button" className="pt-lst-x" aria-label="Chiudi" onClick={() => setListOpen(false)}><Icon name="close" size={18} /></button></div>
                        <div className="pt-lst-b">{list.map((e, i) => { const got = doneOf(i).length, full = got >= e.n; return (
                            <button key={i} type="button" className={'pt-lst-r' + (i === ex ? ' is-cur' : '') + (full ? ' is-done' : '')} onClick={() => { goto(i, Math.min(got, e.n - 1)); setListOpen(false); }}>
                                <span className="pt-lst-n">{full ? <Icon name="check" size={16} /> : i + 1}</span>
                                <span className="pt-lst-t"><b>{e.name}</b><small>{e.n} serie × {e.reps || '–'}</small></span>
                                <span className="pt-lst-s">{got}<i>/{e.n}</i></span>
                            </button>
                        ); })}</div>
                    </div>
                </div>
            )}
            {paused && (
                <div className="pt-pause-ov" role="dialog" aria-modal="true" aria-label="Pausa">
                    <div className="pt-pause-c">
                        <h2>In pausa</h2>
                        <button type="button" className="pt-cta" onClick={() => setPaused(false)}>Riprendi</button>
                        <button type="button" className="pt-btn ghost" onClick={() => onExit(false)}>Esci</button>
                    </div>
                </div>
            )}
        </div>
    );
};
