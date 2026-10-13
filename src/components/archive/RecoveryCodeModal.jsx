import React, { useState } from 'react';
import ReactDOM from 'react-dom';

// Mostra il codice di recupero UNA volta e obbliga a confermare di averlo conservato.
export const RecoveryCodeModal = ({ code, onConfirm }) => {
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* se la clipboard non è disponibile si può sempre copiare a mano */
        }
    };

    const download = () => {
        const text = `URBIOS - CODICE DI RECUPERO\n\n${code}\n\nConserva questo foglio lontano dal computer (carta, cassaforte).\nServe se dimentichi la password: senza password E senza questo codice i dati NON sono recuperabili.\nNon condividerlo: chi lo possiede può aprire l'archivio.\n`;
        const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'URBIOS_codice_di_recupero.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    };

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 max-h-[95vh] overflow-y-auto">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                    <i className="ph-fill ph-key text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Codice di recupero</h3>
                <p className="text-sm text-gray-600 mb-5">
                    Se dimentichi la password, questo codice è l'<strong>unico modo</strong> per riaprire l'archivio. Non esiste nessun server che possa reimpostarla.
                </p>
                <div className="bg-gray-900 text-white rounded-2xl p-5 text-center font-mono text-xl md:text-2xl select-all break-all">{code}</div>
                <div className="flex gap-2 mt-3">
                    <button onClick={copy} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50">
                        {copied ? 'Copiato ✓' : 'Copia'}
                    </button>
                    <button onClick={download} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50">
                        Scarica .txt
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                    Scrivilo su carta e tienilo <strong>lontano dal computer</strong>. Chi ha il codice può aprire l'archivio: non condividerlo.
                </p>
                <label className="flex items-start gap-3 mt-5 cursor-pointer">
                    <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-1 w-4 h-4" />
                    <span className="text-sm text-gray-800">Ho conservato il codice di recupero in un posto sicuro.</span>
                </label>
                <button
                    disabled={!saved}
                    onClick={onConfirm}
                    className={`w-full mt-5 py-3 rounded-xl font-bold text-sm transition-all ${saved ? 'bg-black text-white hover:bg-gray-900' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                    Continua
                </button>
            </div>
        </div>,
        document.body
    );
};
