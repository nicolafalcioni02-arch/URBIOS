import React from 'react';
import { useDraft } from '../useWidgetStore';

// Foglietto: si scrive direttamente sopra. Colore = tono scelto in modalità modifica.
export const PostIt = ({ data, setData }) => {
    const [text, setText] = useDraft(data.text || '', (v) => setData({ text: v }));
    return (
        <div className="wd-card wd-postit">
            <i className="ph-fill ph-push-pin wd-pin" aria-hidden="true" />
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Scrivi qui…" aria-label="Foglietto" spellCheck={false} />
        </div>
    );
};
