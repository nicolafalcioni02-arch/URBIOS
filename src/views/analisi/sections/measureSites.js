// Punti di misura sul corpo: circonferenze e pliche. `az` = da che lato guardarli (0 davanti, PI dietro, -PI/2 lato destro del soggetto).
export const CIRC_SITES = [
    { id: 'collo', key: 'cm_collo', label: 'Collo', unit: 'cm', az: 0, how: 'Nastro orizzontale subito sotto il pomo d\'Adamo, testa dritta e sguardo avanti.' },
    { id: 'torace', key: 'cm_torace', label: 'Torace', unit: 'cm', az: 0, how: 'Nastro orizzontale all\'altezza dei capezzoli (nella donna sotto il seno), a fine espirazione normale.' },
    { id: 'vita', key: 'cm_vita_min', label: 'Vita (min)', unit: 'cm', az: 0, how: 'Nel punto più stretto tra l\'ultima costola e la cresta iliaca, a fine espirazione, senza stringere.' },
    { id: 'fianchi', key: 'cm_fianchi_max', label: 'Fianchi (max)', unit: 'cm', az: -Math.PI / 2, how: 'Nel punto di massima sporgenza dei glutei, a piedi uniti, nastro parallelo al pavimento.' },
    { id: 'braccio', key: 'circ_braccio_dx', label: 'Braccio (dx)', unit: 'cm', az: -Math.PI / 2, how: 'A metà tra acromion (spalla) e olecrano (gomito), braccio rilassato lungo il fianco.' },
    { id: 'coscia', key: 'circ_coscia_dx', label: 'Coscia (dx)', unit: 'cm', az: 0, how: 'Subito sotto la piega del gluteo, peso scaricato sull\'altra gamba.' },
    { id: 'polpaccio', key: 'circ_polpaccio_dx', label: 'Polpaccio (dx)', unit: 'cm', az: 0.5, how: 'Nel punto di massima circonferenza del polpaccio, piede appoggiato.' },
];

// pos: dove si trova la plica. torso: altezza u (0-1) e frazioni della semilarghezza; arm: braccio destro; leg: gamba destra.
export const PLI_SITES = [
    { id: 'pl_pettorale', key: 'pl_pettorale', label: 'Pettorale', unit: 'mm', az: -0.5, pos: { type: 'torso', u: 0.715, fx: -0.55, dir: [0, 0, 1] }, how: 'Piega diagonale a metà tra ascella anteriore e capezzolo (nella donna a un terzo).' },
    { id: 'pl_tricipite', key: 'pl_tricipite', label: 'Tricipite', unit: 'mm', az: Math.PI, pos: { type: 'arm', dir: [0, 0, -1] }, how: 'Piega verticale sulla faccia posteriore del braccio, a metà tra acromion e olecrano.' },
    { id: 'pl_bicipite', key: 'pl_bicipite', label: 'Bicipite', unit: 'mm', az: -0.3, pos: { type: 'arm', dir: [0, 0, 1] }, how: 'Piega verticale sulla faccia anteriore del braccio, alla stessa altezza del tricipite.' },
    { id: 'pl_sottoscap', key: 'pl_sottoscap', label: 'Sottoscapolare', unit: 'mm', az: Math.PI, pos: { type: 'torso', u: 0.7, fx: -0.35, dir: [0, 0, -1] }, how: 'Piega obliqua (45°) 1-2 cm sotto l\'angolo inferiore della scapola.' },
    { id: 'pl_ascellare', key: 'pl_ascellare', label: 'Ascellare', unit: 'mm', az: -Math.PI / 2, pos: { type: 'torso', u: 0.665, fz: 0.05, dir: [-1, 0, 0] }, how: 'Piega verticale sulla linea medioascellare, all\'altezza dello xifoide (fine dello sterno).' },
    { id: 'pl_addome', key: 'pl_addome', label: 'Addominale', unit: 'mm', az: 0, pos: { type: 'torso', u: 0.595, fx: -0.22, dir: [0, 0, 1] }, how: 'Piega verticale 2-3 cm di lato all\'ombelico.' },
    { id: 'pl_sovrailiaca', key: 'pl_sovrailiaca', label: 'Sovrailiaca', unit: 'mm', az: -Math.PI / 2.4, pos: { type: 'torso', u: 0.55, fz: 0.25, dir: [-1, 0, 0.35] }, how: 'Piega obliqua appena sopra la cresta iliaca, sulla linea medioascellare.' },
    { id: 'pl_coscia', key: 'pl_coscia', label: 'Coscia', unit: 'mm', az: 0, pos: { type: 'leg', u: 0.33, dir: [0, 0, 1] }, how: 'Piega verticale sulla faccia anteriore, a metà tra inguine e rotula.' },
    { id: 'pl_polpaccio', key: 'pl_polpaccio', label: 'Polpaccio', unit: 'mm', az: 0.6, pos: { type: 'leg', u: 0.2, dir: [1, 0, 0] }, how: 'Piega verticale sulla faccia mediale (interna), nel punto di massima circonferenza.' },
];
