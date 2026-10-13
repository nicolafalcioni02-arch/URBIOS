import { DEFAULT_RANGE_EMATO } from '../../../../../logic/db_defaults.js';

// Formattatori HTML del report (valori, range ematici, pannelli)
export const createReportHelpers = ({ d, patient }) => {
    // --- 1. HELPERS ---
    const val = (v, u = '') =>
        v && v !== '-'
            ? `<span style="font-weight:600; color:#000;">${v}</span><span style="font-size:0.75em; color:#666; margin-left:2px;">${u}</span>`
            : '<span style="color:#ccc;">-</span>';

    const txt = (t) => (t ? t.replace(/\n/g, '<br>') : '<span style="color:#ccc; font-style:italic;">Nessun dato</span>');

    const bi = (sx, dx) => {
        if (!sx && !dx) return '<span style="color:#ccc;">-</span>';
        return `${sx ? `<b>${sx}</b><span style="font-size:0.7em">L</span>` : ''} <span style="color:#ccc">|</span> ${dx ? `<b>${dx}</b><span style="font-size:0.7em">R</span>` : ''}`;
    };

    const vr = (v, key, fallbackUnit = '') => {
        if (!v || v === '-') return null;
        let color = '#000';
        let u = fallbackUnit;
        let rangeText = '';

        try {
            const rangesToUse = d.rangeEmato || (typeof DEFAULT_RANGE_EMATO !== 'undefined' ? DEFAULT_RANGE_EMATO : {});
            const range = rangesToUse[key];

            if (range) {
                if (d[`${key}_unit`]) {
                    u = d[`${key}_unit`];
                } else if (range.unit) {
                    u = range.unit;
                }

                const numVal = parseFloat(v.toString().replace(',', '.'));

                if (!isNaN(numVal)) {
                    // 3. Controllo sicuro del sesso
                    const sesso = patient?.sesso ? patient.sesso.toUpperCase() : '';
                    const isM = sesso.startsWith('M') || sesso === 'UOMO';

                    // 4. Prende min e max dal JSON o dal Default
                    const min = isM ? range.minM : range.minF;
                    const max = isM ? range.maxM : range.maxF;

                    // 5. Colora di rosso se fuori range
                    if (numVal < min || numVal > max) {
                        color = '#dc2626';
                    }

                    // 6. Genera la stringa con i limiti es: "[70 - 100]"
                    if (min !== undefined && max !== undefined && (min !== 0 || max !== 0)) {
                        rangeText = `[${min} - ${max}]`;
                    }
                }
            }
        } catch (e) {
            console.error('Errore lettura range dal JSON:', e);
        }

        return `<span style="font-weight:600; color:${color};">${v}</span><span style="font-size:0.75em; color:#666; margin-left:3px;">${u}</span><span style="font-size:0.65em; color:#999; margin-left:3px;">${rangeText}</span>`;
    };

    // Helper per nascondere i pannelli vuoti (QUELLO CHE MANCAVA)
    const renderPanel = (title, items) => {
        const rows = items
            .filter((i) => i.v && !i.v.includes('color:#ccc;">-</span>'))
            .map(
                (i) =>
                    `<tr><td style="padding: 4px 8px; color: #555; border-bottom: 1px solid #f0f0f0;">${i.l}</td><td style="padding: 4px 8px; text-align: right; font-weight: 600;">${i.v}</td></tr>`
            )
            .join('');

        if (!rows) return '';

        return `
            <div style="border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; break-inside: avoid;">
                <div style="background: #f4f4f4; padding: 6px 10px; font-size: 7pt; font-weight: 700; text-transform: uppercase; color: #333; border-bottom: 1px solid #e0e0e0;">
                    ${title}
                </div>
                <table style="width: 100%; font-size: 8pt; border-collapse: collapse;">
                    ${rows}
                </table>
            </div>`;
    };

    return { val, txt, bi, vr, renderPanel };
};
