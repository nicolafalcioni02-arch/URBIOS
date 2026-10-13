// Salvataggio su file. Dove il browser lo permette (Chrome/Edge da PC) si sovrascrive sempre lo STESSO file;
// altrove (Safari, Firefox, telefono) viene scaricata una nuova copia.
export const saveTextFile = async (text, { suggestedName, handle } = {}) => {
    if (typeof window !== 'undefined' && window.showSaveFilePicker) {
        const tryWrite = async (h) => {
            const w = await h.createWritable();
            await w.write(text);
            await w.close();
            return { ok: true, handle: h, name: h.name, method: 'file' };
        };
        try {
            if (handle) {
                try {
                    return await tryWrite(handle);
                } catch (e) {
                    if (e && e.name === 'AbortError') throw e;
                    // permesso scaduto: si chiede di nuovo il file
                }
            }
            const h = await window.showSaveFilePicker({
                suggestedName,
                types: [{ description: 'Archivio URBIOS', accept: { 'application/json': ['.json'] } }],
            });
            return await tryWrite(h);
        } catch (e) {
            if (e && e.name === 'AbortError') return { ok: false, cancelled: true };
            // altri errori (es. iframe): si ripiega sul download
        }
    }
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return { ok: true, handle: null, name: suggestedName, method: 'download' };
};

export const readFileAsText = (file) =>
    new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(r.error);
        r.readAsText(file);
    });

// Scarica un Blob come file (usato dall'esportazione)
export const downloadBlob = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
};
