// Numeri dello storico all'italiana: virgola decimale e segno meno tipografico
export const fmtKg = (n) => (n === null || n === undefined || n === '' ? '–' : Number(n).toLocaleString('it-IT', { maximumFractionDigits: 1 }));

export const fmtDelta = (n) => {
    if (!n) return '0';
    const abs = Math.abs(n).toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return `${n > 0 ? '+' : '−'}${abs}`;
};
