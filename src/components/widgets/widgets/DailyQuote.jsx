import React, { useState } from 'react';

// Massime brevi, tutte di pubblico dominio o proverbi.
const QUOTES = [
    ['Che il cibo sia la tua medicina e la medicina il tuo cibo.', 'attribuito a Ippocrate'],
    ['Mens sana in corpore sano.', 'Giovenale'],
    ['Chi va piano va sano e va lontano.', 'proverbio'],
    ['La salute è la vera ricchezza, non l’oro e l’argento.', 'Gandhi'],
    ['Siamo ciò che facciamo ripetutamente: l’eccellenza è un’abitudine.', 'Will Durant, su Aristotele'],
    ['A tavola non si invecchia.', 'proverbio'],
    ['Il movimento è vita.', 'Aristotele'],
    ['Un viaggio di mille miglia comincia con un passo.', 'Lao Tzu'],
    ['La misura è la regola d’oro di ogni cosa.', 'Cleobulo'],
    ['Prevenire è meglio che curare.', 'proverbio'],
    ['Il corpo ottiene ciò in cui crede la mente.', 'proverbio'],
    ['Non è ricco chi ha molto, ma chi ha abbastanza.', 'Seneca'],
    ['Il sonno è la miglior meditazione.', 'Dalai Lama'],
    ['Ogni giorno è una nuova occasione per cambiare vita.', 'proverbio'],
    ['Cadere sette volte, rialzarsi otto.', 'proverbio giapponese'],
    ['La natura, per guarire, ha bisogno di tempo.', 'proverbio'],
    ['Ciò che non ti uccide ti fortifica.', 'Nietzsche'],
    ['Il vero viaggio di scoperta non è cercare nuove terre, ma avere nuovi occhi.', 'Proust'],
    ['L’appetito vien mangiando.', 'proverbio'],
    ['Una mela al giorno toglie il medico di torno.', 'proverbio'],
    ['Si raccoglie ciò che si semina.', 'proverbio'],
    ['La costanza vince il talento quando il talento non è costante.', 'proverbio'],
];

const dayIndex = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);

// Pensiero del giorno: cambia da solo a mezzanotte; con la freccia si sfoglia.
export const DailyQuote = () => {
    const [shift, setShift] = useState(0);
    const [text, by] = QUOTES[(dayIndex() + shift) % QUOTES.length];
    return (
        <div className="wd-card wd-quote">
            <span className="wd-qmark" aria-hidden="true">
                “
            </span>
            <p>{text}</p>
            <small>— {by}</small>
            <button onClick={() => setShift((s) => s + 1)} title="Un altro pensiero" aria-label="Un altro pensiero">
                <i className="ph ph-arrows-clockwise" />
            </button>
        </div>
    );
};
