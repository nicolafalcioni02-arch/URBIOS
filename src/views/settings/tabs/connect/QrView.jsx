import React, { useMemo } from 'react';
import qrcode from 'qrcode-generator';

// Disegna un QR come SVG (nessun innerHTML). `bytes` = contenuto (Uint8Array di testo UTF-8, ~200 byte).
export const QrView = ({ bytes }) => {
    const { n, d } = useMemo(() => {
        const qr = qrcode(0, 'M');
        qr.addData(new TextDecoder().decode(bytes), 'Byte');
        qr.make();
        const n = qr.getModuleCount();
        let d = '';
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
        return { n, d };
    }, [bytes]);
    return (
        <div className="st-qr" role="img" aria-label="Codice QR per collegare l'app del paziente">
            <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} shapeRendering="crispEdges">
                <path d={d} fill="currentColor" />
            </svg>
        </div>
    );
};
