import React, { useRef, useState } from 'react';
import { Page, Group, Btn } from '../../ui/kit';
import { copyText, selectNode } from '../../ui/clipboard';

// "Come citarci": URBIOS è gratuito; a chi lo usa per tesi e pubblicazioni chiediamo di citarlo (APA 7 e BibTeX)
const TITLE = "URBIOS: Software per la gestione clinico-nutrizionale e la prescrizione dell'esercizio fisico";
const APA = `Falcioni, N., Berardi, I., & Bellanova, N. (2026). ${TITLE} (Versione 1.0) [Computer software].`;
const BIB = `@software{urbios2026,
  author  = {Falcioni, Nicola and Berardi, Ilaria and Bellanova, Nicole},
  title   = {${TITLE}},
  year    = {2026},
  version = {1.0},
  note    = {Computer software}
}`;

const Citation = ({ label, children, text, k, state, onCopy, mono }) => {
    const ref = useRef(null);
    const st = state[k];
    return (
        <Group
            title={label}
            aside={
                <Btn variant="secondary" size="sm" icon={st === 'ok' ? 'check' : 'copy'} onClick={() => onCopy(k, text, ref.current)}>
                    {st === 'ok' ? 'Copiata' : 'Copia'}
                </Btn>
            }
        >
            <div ref={ref} className={mono ? 'st-code !mt-0 whitespace-pre-wrap' : 'st-text'} style={mono ? undefined : { paddingLeft: '1.6em', textIndent: '-1.6em' }}>
                {children}
            </div>
            {st === 'sel' && <p className="st-hint mt-3">Testo selezionato: premi ⌘C (o Ctrl+C) per copiarlo.</p>}
        </Group>
    );
};

export const CiteTab = () => {
    const [state, setState] = useState({});
    const onCopy = async (k, text, node) => {
        const ok = await copyText(text);
        if (!ok) selectNode(node);
        setState({ [k]: ok ? 'ok' : 'sel' });
        if (ok) setTimeout(() => setState({}), 2200);
    };
    return (
        <Page
            narrow
            title="Come citare URBIOS"
            intro="URBIOS è gratuito e lo resterà. Se lo usi per una tesi, una pubblicazione, un poster o un lavoro di ricerca, citalo: è il modo più semplice per sostenere il progetto e permetterci di continuare a migliorarlo."
        >
            <Citation label="APA 7" k="apa" text={APA} state={state} onCopy={onCopy}>
                Falcioni, N., Berardi, I., &amp; Bellanova, N. (2026). <i>{TITLE}</i> (Versione 1.0) [Computer software].
            </Citation>
            <Citation label="BibTeX · LaTeX, Zotero, Mendeley" k="bib" text={BIB} state={state} onCopy={onCopy} mono>
                {BIB}
            </Citation>
            <p className="st-hint mt-5">
                Nel testo puoi scrivere, per esempio: «I dati sono stati raccolti ed elaborati con URBIOS (Falcioni, Berardi &amp; Bellanova, 2026)». Grazie!
            </p>
        </Page>
    );
};
