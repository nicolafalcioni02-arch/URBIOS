// Collegamento tra il NOME di un esercizio e le sue figure (catalogo incluso + foto caricate dall'utente).
// Il confronto è per nome ESATTO (o alias noto, senza accenti/maiuscole): meglio nessuna figura che una figura sbagliata sulla scheda di un cliente.
import { EXERCISE_CATALOG } from '../data/exerciseCatalog';
import { EXERCISE_IMAGES } from '../data/exerciseImages';

export const normName = (s) =>
    String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

const INDEX = new Map();
EXERCISE_CATALOG.forEach((e) => {
    [e.name, e.en, ...(e.aliases || [])].forEach((n) => {
        const k = normName(n);
        if (k && !INDEX.has(k)) INDEX.set(k, e);
    });
    // anche il nome senza parentesi esiste già grazie a normName
});

export const findCatalogEntry = (name) => INDEX.get(normName(name)) || null;

// voce del database dell'utente per un esercizio (per nome)
export const findDbEntry = (name, exerciseDB) => {
    const k = normName(name);
    return k ? (exerciseDB || []).find((x) => normName(x.name) === k) || null : null;
};

// foto scattate dal professionista (nuove: photos[]; vecchie: img singola)
export const getOwnPhotos = (name, exerciseDB) => {
    const x = findDbEntry(name, exerciseDB);
    return x ? [...(x.photos || []), ...(x.img ? [x.img] : [])].filter(Boolean) : [];
};

export const getCatalogImages = (name) => {
    const entry = INDEX.get(normName(name));
    return entry && EXERCISE_IMAGES[entry.fdb] ? EXERCISE_IMAGES[entry.fdb] : [];
};

// immagini da mostrare: le foto del professionista hanno la precedenza; quelle del catalogo si aggiungono solo se richiesto (useCatalog)
export const getExerciseImages = (name, exerciseDB) => {
    const own = getOwnPhotos(name, exerciseDB);
    const cat = getCatalogImages(name);
    if (own.length) {
        const x = findDbEntry(name, exerciseDB);
        return x && x.useCatalog && cat.length ? [...own, ...cat] : own;
    }
    return cat;
};

// aggiunge al database dell'utente gli esercizi del catalogo che mancano (senza toccare i suoi)
export const mergeCatalogIntoDb = (exerciseDB) => {
    const have = new Set((exerciseDB || []).map((x) => normName(x.name)));
    const added = EXERCISE_CATALOG.filter((e) => !have.has(normName(e.name))).map(({ name, group, type }) => ({ name, group, type }));
    return { list: [...(exerciseDB || []), ...added], added: added.length };
};

// ridimensiona una foto caricata dall'utente (max 480 px, JPEG) per non appesantire l'archivio
export const resizeImageFile = (file, max = 480, quality = 0.72) =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, max / Math.max(img.width, img.height));
            const c = document.createElement('canvas');
            c.width = Math.round(img.width * scale);
            c.height = Math.round(img.height * scale);
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(url);
            resolve(c.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Immagine non valida'));
        };
        img.src = url;
    });
