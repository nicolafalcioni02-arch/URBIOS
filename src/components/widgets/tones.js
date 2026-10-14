// Toni dei widget: tutti derivati dalla palette di URBIOS (carta, inchiostro, accento blu, verde salvia).
export const TONES = [
    { id: 'carta', label: 'Carta', bg: '#FFFFFF', fg: '#121317', mut: '#6E6D69', line: '#E6E4DE', acc: '#2F54EB', soft: '#F3F2EE' },
    { id: 'sabbia', label: 'Sabbia', bg: '#EFE9DC', fg: '#2B2418', mut: '#7A705C', line: '#E0D7C3', acc: '#B7791F', soft: '#E6DFCE' },
    { id: 'salvia', label: 'Salvia', bg: '#DCE9E1', fg: '#14382A', mut: '#4E7563', line: '#C7DBCE', acc: '#1F8A5B', soft: '#CFE0D5' },
    { id: 'cielo', label: 'Cielo', bg: '#E1E8FB', fg: '#14204D', mut: '#5C6A99', line: '#CCD7F5', acc: '#2F54EB', soft: '#D4DEF8' },
    { id: 'inchiostro', label: 'Inchiostro', bg: '#1A1C22', fg: '#F6F5F2', mut: '#A3A29D', line: '#2C2F39', acc: '#8DA2FF', soft: '#262933' },
    { id: 'accento', label: 'Accento', bg: '#2F54EB', fg: '#FFFFFF', mut: '#C9D3FA', line: '#4A6BF0', acc: '#FFFFFF', soft: '#4262EE' },
];

export const toneVars = (id) => {
    const t = TONES.find((x) => x.id === id) || TONES[0];
    return { '--wd-bg': t.bg, '--wd-fg': t.fg, '--wd-mut': t.mut, '--wd-line': t.line, '--wd-acc': t.acc, '--wd-soft': t.soft };
};

// frazione della larghezza della colonna occupata da ciascuna misura
export const SIZES = [
    { id: 's', label: 'S', frac: 0.62 },
    { id: 'm', label: 'M', frac: 0.82 },
    { id: 'l', label: 'L', frac: 1 },
];
