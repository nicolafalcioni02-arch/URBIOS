import React, { useMemo, useState } from 'react';
import { Icon } from '../ui/icons';
import { buildPrompt, parseFill } from '../aiFill';

const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch {
        try {
            const ta = document.createElement('textarea');
            ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            return ok;
        } catch { return false; }
    }
};

const preview = (c) => (c.count ? `${c.count} ${c.key === 'passaggi' ? 'passaggi' : 'voci'}` : String(c.value).length > 140 ? `${String(c.value).slice(0, 140)}…` : c.value);

// Compila un protocollo con un'AI esterna: 1) descrivi, 2) copia il prompt, 3) incolla la risposta, 4) scegli cosa applicare
export const AiFill = ({ kind = 'protocollo', current, onApply, onClose }) => {
    const art = kind === 'articolo';
    const [text, setText] = useState('');
    const [copied, setCopied] = useState(false);
    const [draft, setDraft] = useState(false);
    const [pasted, setPasted] = useState('');
    const [res, setRes] = useState(null);
    const [sel, setSel] = useState({});
    const prompt = useMemo(() => buildPrompt(text, current, draft, kind), [text, current, draft, kind]);

    const copy = async () => { const ok = await copyText(prompt); setCopied(ok); if (ok) setTimeout(() => setCopied(false), 3500); };
    const read = () => {
        const r = parseFill(pasted, current, kind);
        setRes(r);
        setSel(Object.fromEntries(r.changes.map((c) => [c.key, true])));
    };
    const apply = () => {
        const patch = Object.fromEntries(res.changes.filter((c) => sel[c.key]).map((c) => [c.key, c.value]));
        onApply(patch);
        onClose();
    };
    const n = res?.ok ? res.changes.filter((c) => sel[c.key]).length : 0;

    return (
        <div className="sheet-back lab-ai-back" onClick={onClose}>
            <div className="lab-modal lab-imp lab-ai" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={art ? 'Compila la scheda con l’AI' : 'Compila il protocollo con l’AI'}>
                <div className="lab-pane-head"><h2 className="lab-pane-title">Compila con l’AI</h2><button type="button" className="lab-x" aria-label="Chiudi" onClick={onClose}><Icon name="x" size={18} /></button></div>

                <section className="lab-imp-sec">
                    <h3>1. Aggiungi informazioni (facoltativo)</h3>
                    <p className="lab-imp-note">{art ? 'Il nome e i dati già scritti vanno all’AI, che compila la scheda tecnica, il pericolo, la conservazione e la condizione (ghiaccio, pericolo). Puoi aggiungere appunti o il numero del prodotto.' : 'Quello che hai già scritto nel modulo viene mandato all’AI, che lo completa e lo sistema. Qui puoi aggiungere appunti, il metodo di un articolo o istruzioni («aggiungi i tempi», «controlla le quantità»). L’AI indica anche, per ogni materiale, se va tenuto in ghiaccio o è pericoloso.'}</p>
                    <textarea className="fld" rows={6} style={{ height: 'auto', paddingTop: 10 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="es. Estrazione del DNA da sangue con kit… centrifugare a 13000 g per 1 min…" />
                    {!art && <label className="lab-aicheck"><input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} />Se mancano la procedura o i materiali, proponi una bozza (da verificare)</label>}
                </section>

                <section className="lab-imp-sec">
                    <h3>2. Copia il prompt e incollalo nella tua AI</h3>
                    <p className="lab-imp-note">ChatGPT, Claude, Gemini… quella che preferisci. Il prompt non contiene dati di pazienti.</p>
                    <button type="button" className="lab-btn is-secondary is-sm" onClick={copy}><Icon name={copied ? 'check' : 'copy'} size={16} />{copied ? 'Copiato' : 'Copia il prompt'}</button>
                </section>

                <section className="lab-imp-sec">
                    <h3>3. Incolla qui la risposta</h3>
                    <textarea className="fld" rows={6} style={{ height: 'auto', paddingTop: 10 }} value={pasted} onChange={(e) => { setPasted(e.target.value); setRes(null); }} placeholder="Incolla la risposta completa dell’AI" />
                    <div style={{ marginTop: 8 }}><button type="button" className="lab-btn is-secondary is-sm" disabled={!pasted.trim()} onClick={read}>Leggi la risposta</button></div>
                    {res && !res.ok && <p className="lab-imp-bad" style={{ marginTop: 8 }}>{res.fatal}</p>}
                </section>

                {res?.ok && (
                    <section className="lab-imp-sec">
                        <h3>4. Scegli cosa applicare</h3>
                        <p className="lab-imp-note">Sono tutti selezionati: togli la spunta ai campi già compilati che vuoi tenere come sono.</p>
                        <div className="lab-imp-tbl">
                            <table><tbody>
                                {res.changes.map((c) => (
                                    <tr key={c.key}>
                                        <td><input type="checkbox" checked={!!sel[c.key]} onChange={(e) => setSel({ ...sel, [c.key]: e.target.checked })} aria-label={c.label} /></td>
                                        <th>{c.label}</th>
                                        <td style={{ whiteSpace: 'normal' }}>{preview(c)}</td>
                                        <td><span className={`lab-imp-st ${c.kind === 'new' ? 'nuovo' : 'aggiornato'}`}>{c.kind === 'new' ? 'nuovo' : 'sostituisce'}</span></td>
                                    </tr>
                                ))}
                            </tbody></table>
                        </div>
                        {res.notes.length > 0 && <><p className="lab-imp-note" style={{ marginTop: 10 }}><b>L’AI segnala:</b></p><ul className="lab-imp-note" style={{ paddingLeft: 18, margin: 0 }}>{res.notes.map((x, i) => <li key={i}>{x}</li>)}</ul></>}
                    </section>
                )}

                <div className="lab-imp-foot">
                    <button type="button" className="lab-btn is-secondary" onClick={onClose}>Annulla</button>
                    <button type="button" className="lab-btn is-primary" disabled={!n} onClick={apply}>Applica{n ? ` (${n})` : ''}</button>
                </div>
            </div>
        </div>
    );
};
