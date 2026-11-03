// Aspetti grafici dell'app. L'aspetto scelto vive nel db (db.aspetto), così segue il file archivio.
// Ogni aspetto diverso da "classico" ha il suo foglio di stile in questa cartella, attivo solo con
// <html data-look="id">: togliere l'attributo riporta l'app esattamente com'era.

export const LOOKS = [
    {
        id: 'classico',
        name: 'Classico',
        sub: 'Per i più seri, che amano l\'eleganza: carta calda, inchiostro e niente fronzoli',
        swatches: ['#F6F5F2', '#FFFFFF', '#121317', '#2F54EB'],
    },
    {
        id: 'vetro',
        name: 'Vetro',
        sub: 'Per i più creativi e vivaci, che amano il colore: vetro, sfumature e un pizzico di follia',
        swatches: ['#F4F0E4', '#E3EC4F', '#C9C3F2', '#F6CDB4'],
    },
];

export const DEFAULT_LOOK = 'vetro';

export const lookOf = (db) => (LOOKS.some((l) => l.id === db?.aspetto) ? db.aspetto : DEFAULT_LOOK);

export const applyLook = (id) => {
    const root = document.documentElement;
    const look = id || DEFAULT_LOOK;
    if (look === 'classico') delete root.dataset.look;
    else root.dataset.look = look;
};
