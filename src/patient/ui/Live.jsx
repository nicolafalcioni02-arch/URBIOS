import { UrbiosLogo } from '../../brand/UrbiosLogo.jsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon, Step, Lst } from './bits.jsx';
import { TempoBar, parseTempo } from './Tempo.jsx';
import { Clamp } from './Clamp.jsx';
import { arr, mmss, parseSets, parseRest, sessionKey, suggestLoad, fmtDay, fmtKg, ymd, workoutSummary, sessionDate, HYPE_END } from './logic.js';

// Allenamento guidato, un esercizio alla volta. Ogni serie fatta (carico, RPE, nota) si salva SUBITO sul telefono, anche senza rete.
// Non c'è video né calorie consumate: non fanno parte di ciò che il professionista invia. Il diario resta qui.
const buzz = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch { /* non disponibile */ } };
const RPES = [6, 7, 8, 9, 10];
// serie consecutive con stesso carico e stesso RPE → una voce sola («3 × 50 kg · RPE 8»)
const groupSets = (sets) => sets.reduce((o, x) => { const l = o[o.length - 1]; if (l && l.kg === x.kg && (l.rpe || 0) === (x.rpe || 0) && (l.reps || 0) === (x.reps || 0)) l.n += 1; else o.push({ n: 1, kg: x.kg, rpe: x.rpe, reps: x.reps }); return o; }, []);

const CountUp = ({ n }) => {
    const [v, setV] = useState(0);
    useEffect(() => { let raf, t0; const f = (t) => { t0 = t0 || t; const p = Math.min(1, (t - t0) / 1200); setV(Math.round(n * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf); }, [n]);
    return <b>{String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</b>;
};

export const Live = ({ rt, id, w, d, onExit }) => {
    // barra di stato del telefono scura come lo schermo (altrimenti resta una fascia lilla in alto)
    useEffect(() => { const m = document.querySelector('meta[name="theme-color"]'); if (!m) return undefined; const old = m.getAttribute('content'); m.setAttribute('content', '#160C33'); return () => m.setAttribute('content', old); }, []);
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
    const [note, setNote] = useState(''), [panel, setPanel] = useState(null), [hit, setHit] = useState(0);
    const [hype, setHype] = useState(null);
    const [edit, setEdit] = useState(null), bak = useRef(undefined);      // modifica di una serie già fatta: { ret } = dove tornare
    useEffect(() => { if (!hype) return undefined; const t = setTimeout(() => setHype(null), 3200); return () => clearTimeout(t); }, [hype]);
    const [lastRpe, setLastRpe] = useState(null);                 // RPE della serie appena fatta (si cambia durante il riposo)
    const total = useRef(0), ac = useRef(null), lastSet = useRef(null);
    // tempi dall'orologio (non da incrementi: con lo schermo spento il timer non si ferma). run = secondi accumulati prima di runAt; restEnd 0 = non in riposo
    const T = useRef({ run: start.secs || 0, runAt: Date.now(), setAt: Date.now(), restEnd: 0, restTot: 0, lastBeep: null, pausedAt: 0 });
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
                    setPhase('work'); setRest(0); setSetSecs(Math.floor((now - end) / 1000));
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
    const frontier = () => { for (let i = 0; i < list.length; i++) if (doneOf(i).length < list[i].n) return { ex: i, set: doneOf(i).length }; return null; };
    const retPos = () => (edit ? edit.ret : doneOf(ex).length < cur.n ? { ex, set: setNo } : frontier());   // dove tornare dopo una modifica (null = tutto fatto)
    const goto = (i, s) => {
        if (edit) { setEdit(null); setLastRpe(null); lastSet.current = bak.current === undefined ? null : bak.current; bak.current = undefined; }
        const f = list[i] && doneOf(i).length >= list[i].n;   // esercizio già finito: si riapre con quello che hai fatto, non da zero
        if (f) { openEdit(i, Math.max(0, Math.min(s, list[i].n - 1)), retPos()); return; }
        go(i, s);
    };
    const go = (i, s) => { rt.log.update((l) => { const q = l.sessions[key] || (l.sessions[key] = { sets: {}, started: Date.now() }); q.pos = { ex: i }; q.secs = elapsed; }); setEx(i); setSetNo(s); setKg(kgOf(i)); setNote(''); setPhase('work'); setSetSecs(0); setRest(0); T.current.restEnd = 0; T.current.setAt = Date.now(); T.current.lastBeep = null; };
    const openEdit = (exI, idx, ret) => {
        const rec = doneOf(exI)[idx]; if (!rec) return;
        if (bak.current === undefined) bak.current = lastSet.current;
        setEdit({ ret }); setEx(exI); setSetNo(idx); setKg(rec.kg); setNote(rec.note || ''); setLastRpe(rec.rpe || null);
        setPhase('work'); setRest(0); setSetSecs(0); T.current.restEnd = 0; T.current.setAt = Date.now(); T.current.lastBeep = null;
        lastSet.current = { exI, name: list[exI].name, date: ymd(), idx };
    };
    // scrive kg e nota della serie aperta (voce di sessione e voce di storico di oggi)
    const commitEdit = () => {
        const exI = ex, idx = setNo, name = cur.name, n = note.trim().slice(0, 200), k = kg, date = ymd();
        rt.log.update((l) => {
            const a = ((l.sessions[key] || {}).sets || {})[exI], put = (x) => { if (!x) return; x.kg = k; if (n) x.note = n; else delete x.note; };
            put(a && a[idx]);
            const h = arr(l.hist[name]).find((x) => x.date === date); if (h && a) put(h.sets[h.sets.length - a.length + idx]);
            if (a && idx === a.length - 1) l.last[name] = k;
        });
    };
    const leaveEdit = () => { const r = edit.ret; if (r && doneOf(r.ex).length < list[r.ex].n) { goto(r.ex, r.set); return; } const f = frontier(); if (f) goto(f.ex, f.set); else { setEdit(null); lastSet.current = bak.current === undefined ? null : bak.current; bak.current = undefined; setFin(true); } };
    const saveEdit = () => {     // «Salva» passa alla serie dopo nello stesso esercizio (già fatta = si modifica, altrimenti è quella da fare); solo dopo l'ultima si torna dove eri
        commitEdit(); buzz(30);
        const n = list[ex].n;
        if (setNo + 1 < n) { if (doneOf(ex)[setNo + 1]) openEdit(ex, setNo + 1, edit.ret); else goto(ex, setNo + 1); return; }
        leaveEdit();
    };
    const hasPrevSet = setNo > 0 && !!doneOf(ex)[setNo - 1], hasNextSet = !!doneOf(ex)[setNo + 1];
    // frecce: nello stesso esercizio vanno alla serie accanto, altrimenti all'esercizio accanto (anche se non ha serie fatte)
    const prev = () => {
        if (edit) commitEdit();
        if (hasPrevSet) { openEdit(ex, setNo - 1, retPos()); return; }
        if (ex > 0) { const dn = doneOf(ex - 1).length; if (dn) openEdit(ex - 1, Math.min(dn, list[ex - 1].n) - 1, retPos()); else goto(ex - 1, 0); }
    };
    const nextEdit = () => {
        commitEdit();
        if (hasNextSet) { openEdit(ex, setNo + 1, edit.ret); return; }
        if (ex + 1 < list.length) { if (doneOf(ex + 1).length) openEdit(ex + 1, 0, edit.ret); else goto(ex + 1, 0); return; }
        leaveEdit();
    };
    const nextEx = (i) => { if (i + 1 < list.length) { go(i + 1, Math.min(doneOf(i + 1).length, list[i + 1].n - 1)); return true; } return false; };
    const complete = () => {
        if (edit) { saveEdit(); return; }
        if (!ac.current) beep(1, 1);                      // il primo tocco sblocca l'audio
        const exI = ex, rec = { kg, ...(note.trim() ? { note: note.trim().slice(0, 200) } : {}) }, secs = elapsed, date = ymd();
        rt.log.update((l) => {
            const s = l.sessions[key] || (l.sessions[key] = { sets: {}, started: Date.now() });
            (s.sets[exI] = s.sets[exI] || []).push(rec); s.secs = secs; l.last[cur.name] = kg;
            const h = l.hist[cur.name] || (l.hist[cur.name] = []); let t = h.find((x) => x.date === date); if (!t) { t = { date, sets: [] }; h.push(t); }
            t.sets.push(rec); if (h.length > 12) h.splice(0, h.length - 12);
        });
        total.current += 1; buzz(30); beep(740, 90);
        setNote(''); setLastRpe(null); lastSet.current = { exI, name: cur.name, date }; setHit((x) => x + 1);
        let more = true;
        if (setNo + 1 < cur.n) setSetNo(setNo + 1); else more = nextEx(ex);
        if (!more) { setFin(true); buzz([80, 50, 80, 50, 200]); return; }
        setPhase('rest'); setRest(cur.rest); T.current.restEnd = Date.now() + cur.rest * 1000; T.current.restTot = cur.rest; T.current.lastBeep = null;
    };
    const skipRest = () => { setPhase('work'); setRest(0); setSetSecs(0); T.current.restEnd = 0; T.current.setAt = Date.now(); T.current.lastBeep = null; };
    // ±15 secondi di riposo (il livello si adegua: restTot cresce col «+»)
    const adjRest = (ms) => { const t = T.current; if (!t.restEnd) return; const now = Date.now(); t.restEnd = ms < 0 ? Math.max(now + 1000, t.restEnd + ms) : t.restEnd + ms; if (ms > 0) t.restTot += ms / 1000; setRest(Math.ceil((t.restEnd - now) / 1000)); };
    // l'RPE riguarda la serie appena fatta (in riposo, o nella schermata finale): si scrive subito nel diario (voce di sessione e voce di storico, che nell'app vera sono oggetti diversi)
    const pickRpe = (r) => {
        const L = lastSet.current;
        if (!L) return;
        const v = lastRpe === r ? null : r, put = (x) => { if (x) { if (v) x.rpe = v; else delete x.rpe; } };
        rt.log.update((l) => { const a = ((l.sessions[key] || {}).sets || {})[L.exI], i = L.idx === undefined && a ? a.length - 1 : L.idx; put(a && a[i]); const h = arr(l.hist[L.name]).find((x) => x.date === L.date); put(h && a && h.sets[h.sets.length - a.length + i]); });
        setLastRpe(v);
    };
    const skipEx = () => { setPaused(false); if (ex + 1 < list.length) goto(ex + 1, Math.min(doneOf(ex + 1).length, list[ex + 1].n - 1)); else setFin(true); };

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
                {lastSet.current && <div className="pt-win-rpe"><span className="pt-fl">RPE</span><div className="pt-rpe">{RPES.map((r) => <button key={r} type="button" className={lastRpe === r ? 'is-on' : ''} aria-pressed={lastRpe === r} onClick={() => pickRpe(r)}>{r}</button>)}</div></div>}
                <button type="button" className="pt-cta" onClick={() => onExit(true)}>Torna alla dashboard</button>
            </div>
        );
    }
    const logged = doneOf(ex).length, shownRpe = lastRpe;
    const pro = [wk && wk.nota && ['Settimana', wk.nota], day && day.nota && ['Giornata', day.nota], cur.note && ['Esercizio', cur.note]].filter(Boolean);
    const mine = arr(rt.log.get().hist[cur.name]).flatMap((h) => arr(h.sets).filter((x) => x.note).map((x) => ({ date: h.date, text: x.note }))).reverse().slice(0, 8);
    const tempo = parseTempo(cur.tempo), isRest = phase === 'rest';
    const lastT = arr(rt.log.get().hist[cur.name]).filter((h) => h.date !== ymd() && arr(h.sets).length).slice(-1)[0];   // ultima seduta passata
    const lastKg = lastT ? Math.max(...lastT.sets.map((x) => +x.kg || 0)) : 0;
    const nx = list[ex], showNext = isRest && nx && lastSet.current && nx.name !== lastSet.current.name;
    const lvl = isRest ? Math.max(0, Math.min(100, rest / Math.max(1, T.current.restTot) * 100)) : 0;
    const dots = <span className="pt-live-dots" aria-label={`Serie ${Math.min(setNo + 1, cur.n)} di ${cur.n}`}>{Array.from({ length: Math.min(cur.n, 12) }, (_, i) => <i key={i + '-' + (i === logged - 1 ? hit : 0)} className={edit && i === setNo ? 'cur' : i < logged ? 'done' + (i === logged - 1 && hit ? ' pop' : '') : i === Math.min(setNo, cur.n - 1) ? 'cur' : ''} />)}</span>;
    const rpeRow = <><span className="pt-fl">RPE</span><div className="pt-rpe">{RPES.map((r) => <button key={r} type="button" className={shownRpe === r ? 'is-on' : ''} aria-pressed={shownRpe === r} onClick={() => pickRpe(r)}>{r}</button>)}</div></>;
    const stepKg = <Step value={kg} onChange={setKg} step={2.5} min={0} max={1000} fmt={fmtKg} unit="kg" text={cur.kg0 === 0 && kg === 0 ? 'Corpo libero' : undefined} label="Carico" />;
    return (
        <div className={'pt-live pt-lv2' + (paused ? ' is-paused' : '') + (isRest ? ' is-rest' : '')}>
            {hype && <div className="pt-hype" role="status" onClick={() => setHype(null)}>{hype}</div>}
            <div className="pt-live-bg pt-lb2">
                <div className="pt-lv-mark" aria-hidden="true"><UrbiosLogo size={440} /></div>
                {isRest && <div className="pt-rest-w" style={{ height: lvl + '%' }}><svg viewBox="0 0 800 30" preserveAspectRatio="none" aria-hidden="true"><path d="M0 15Q100 0 200 15T400 15T600 15T800 15V30H0Z" /></svg></div>}
                {hit > 0 && <i className="pt-veil" key={hit} aria-hidden="true" />}
                {isRest ? <>
                    <b className="pt-rest-ex">{cur.name}</b>
                    <b className={'pt-rest-t' + (rest <= 3 ? ' is-end' : '')} key={rest <= 3 ? rest : 'n'} role="timer" aria-label="Riposo">{mmss(rest)}</b>
                    <div className="pt-live-row">{dots}</div>
                    {showNext && <div className="pt-nx2" aria-label={'Dopo: ' + nx.name}><Icon name="chev" size={16} /><b>{nx.name}</b><span>{Math.min(setNo + 1, nx.n)}/{nx.n}</span></div>}
                </> : <>
                    <Clamp as="b" lines={3} title="Esercizio" text={(cur.ss ? cur.ss + ' · ' : '') + cur.name} className={'pt-live-ex' + (cur.name && cur.name.length > 44 ? ' is-xl' : cur.name && cur.name.length > 26 ? ' is-long' : '')} />
                    {tempo && <TempoBar key={ex + '-' + setNo} tempo={tempo} dark run />}
                    {cur.rpe ? <div className="pt-live-rpe" aria-label={'RPE previsto ' + cur.rpe}><small>RPE</small><b>{cur.rpe}</b></div> : null}
                    <div className="pt-live-row">{dots}</div>
                </>}
            </div>
            <div className="pt-live-top pt-lt2">
                <div className="pt-lp" aria-label={`Esercizio ${ex + 1} di ${list.length}`}>{list.map((_, i) => <i key={i} className={i < ex ? 'done' : i === ex ? 'cur' : ''} />)}</div>
                <span className="pt-el">{mmss(elapsed)}</span>
                <button type="button" className="pt-pause pt-note-b" aria-label="Note" onClick={() => setPanel('note')}><Icon name="note" size={22} />{pro.length > 0 && <u />}</button>
                <button type="button" className="pt-pause" aria-label="Esercizi" onClick={() => setListOpen(true)}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" /></svg></button>
                <button type="button" className="pt-pause" aria-label="Pausa" onClick={() => setPaused(true)}><Icon name="pause" size={22} /></button>
            </div>
            <section className="pt-sheet pt-sh2">
                <svg className="pt-sw" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40V36Q0 26 18 26H62C118 26 132 12 200 12S282 26 338 26H382Q400 26 400 36V40Z" fill="#fff" /></svg>
                {!isRest && !edit && <div className="pt-t2"><b>{mmss(setSecs)}</b></div>}
                {!isRest && <div className="pt-rk">{cur.reps ? <span className={'pt-reps' + (String(cur.reps).length > 3 ? ' is-s' : '')}><b>{cur.reps}</b><i>×</i></span> : null}{stepKg}</div>}
                {!isRest && !edit && lastT && <button type="button" className="pt-lastb" onClick={() => setPanel('storia')}><span>{String(lastT.date).split('-').reverse().slice(0, 2).join('/')} · {fmtKg(lastKg)} kg</span><Icon name="chev" size={16} /></button>}
                {!isRest && sug && sug.kg !== kg && <div className="pt-sug"><div><span>Suggerito</span><b>{fmtKg(sug.kg)} kg</b></div><button type="button" onClick={() => setKg(sug.kg)}>Usa</button></div>}
                {(isRest || edit) && rpeRow}
                {isRest && <div className="pt-rk is-rest">{stepKg}</div>}
                <div className="pt-bt">
                    {isRest ? <button type="button" className="pt-rnd pt-rnd-t" aria-label="Quindici secondi in meno" onClick={() => adjRest(-15000)}>−15</button>
                        : <button type="button" className="pt-rnd" aria-label={hasPrevSet ? 'Serie precedente' : 'Esercizio precedente'} disabled={!hasPrevSet && ex === 0} onClick={prev}><Icon name="back" size={22} /></button>}
                    {isRest ? <button type="button" className="pt-done is-sec" onClick={skipRest}>Salta</button> : <button type="button" className="pt-done" onClick={complete}><Icon name="check" size={20} />{edit ? 'Salva' : 'Fatta'}</button>}
                    {isRest ? <button type="button" className="pt-rnd pt-rnd-t" aria-label="Quindici secondi in più" onClick={() => adjRest(15000)}>+15</button>
                        : <button type="button" className="pt-rnd" aria-label={edit ? (hasNextSet ? 'Serie successiva' : 'Esercizio successivo') : 'Salta esercizio'} onClick={edit ? nextEdit : skipEx}><Icon name="chev" size={22} /></button>}
                </div>
            </section>
            {panel === 'storia' && (
                <Lst title="Storico" onClose={() => setPanel(null)}>
                    {past.length ? past.map((h, hi) => (
                        <div className="pt-past" key={h.date + '-' + hi}>
                            <b className="pt-past-d">{String(h.date).split('-').reverse().join('/')}</b>
                            <div className="pt-past-b"><div className="pt-past-s">{groupSets(h.sets).map((g, i) => <u key={i}>{g.n > 1 ? <b>{g.n} serie</b> : null}{fmtKg(g.kg)}<small>kg</small>{g.reps ? <s>× {g.reps} rep</s> : null}{g.rpe ? <i>RPE {g.rpe}</i> : null}</u>)}</div></div>
                        </div>
                    )) : <p className="pt-muted">–</p>}
                </Lst>
            )}
            {panel === 'note' && (
                <Lst title="Note" onClose={() => setPanel(null)}>
                    {pro.map(([, t], i) => <div className="pt-pn" key={i}>{t}</div>)}
                    <label className="pt-nw"><span className="pt-nw-i"><Icon name="note" size={18} /></span><textarea rows="2" value={note} maxLength={200} placeholder="Scrivi una nota" onChange={(e) => setNote(e.target.value)} /></label>
                    {mine.map((n, i) => <div className="pt-past" key={'m' + i}><b className="pt-past-d">{String(n.date).split('-').reverse().join('/')}</b><span>{n.text}</span></div>)}
                </Lst>
            )}
            {listOpen && (
                <Lst title="Esercizi" label="Esercizi" onClose={() => setListOpen(false)}>
                        {list.map((e, i) => { const got = doneOf(i).length, full = got >= e.n; return (
                            <button key={i} type="button" className={'pt-lst-r' + (i === ex ? ' is-cur' : '') + (full ? ' is-done' : '')} onClick={() => { goto(i, Math.min(got, e.n - 1)); setListOpen(false); }}>
                                <span className="pt-lst-n">{full ? <Icon name="check" size={16} /> : i + 1}</span>
                                <span className="pt-lst-t"><b>{e.name}</b><small>{e.n} serie × {e.reps || '–'}</small></span>
                                <span className="pt-lst-s">{got}<i>/{e.n}</i></span>
                            </button>
                        ); })}
                </Lst>
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
