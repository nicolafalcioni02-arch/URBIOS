// Elenco dei widget disponibili. Per aggiungerne uno: crea il componente in widgets/ e aggiungi una riga qui.
// size = [larghezza, altezza] in celle di partenza, min = minimo consentito, fit = 'contain' (si rimpicciolisce per starci tutto)
// oppure 'fixed: true' = dimensioni bloccate (niente maniglie: la grafica e' pensata per quella misura), oppure 'width' (si adatta in larghezza e scorre in altezza). tone = tono di partenza. Ogni widget riceve { id, data, setData, db, tone }.
import { ClockRoman } from './widgets/ClockRoman';
import { PostIt } from './widgets/PostIt';
import { TodoNotebook } from './widgets/TodoNotebook';
import { MonthCalendar } from './widgets/MonthCalendar';
import { Timer } from './widgets/Timer';
import { MoonPhase } from './widgets/MoonPhase';
import { DailyQuote } from './widgets/DailyQuote';
import { WaterGlasses } from './widgets/WaterGlasses';
import { Agenda } from './widgets/Agenda';
import { Birthdays } from './widgets/Birthdays';

export const WIDGETS = [
    { type: 'clock', label: 'Orologio', icon: 'ph-clock', Component: ClockRoman, tone: 'carta', size: [3, 3], min: [1, 1], fit: 'contain', fixed: true },
    { type: 'agenda', label: 'Appuntamenti', icon: 'ph-calendar-check', Component: Agenda, tone: 'carta', size: [4, 3], min: [2, 3], fit: 'width' },
    { type: 'birthdays', label: 'Compleanni', icon: 'ph-cake', Component: Birthdays, tone: 'salvia', size: [3, 2], min: [2, 2], fit: 'width' },
    { type: 'postit', label: 'Foglietto', icon: 'ph-note', Component: PostIt, tone: 'sabbia', size: [3, 3], min: [2, 2], fit: 'width' },
    { type: 'todo', label: 'Da fare', icon: 'ph-list-checks', Component: TodoNotebook, tone: 'carta', size: [4, 3], min: [2, 2], fit: 'width' },
    { type: 'calendar', label: 'Calendario', icon: 'ph-calendar-blank', Component: MonthCalendar, tone: 'carta', size: [3, 3], min: [3, 3], fit: 'contain', fixed: true },
    { type: 'timer', label: 'Timer', icon: 'ph-timer', Component: Timer, tone: 'inchiostro', size: [3, 3], min: [2, 2], fit: 'contain', fixed: true },
    { type: 'moon', label: 'Luna', icon: 'ph-moon-stars', Component: MoonPhase, tone: 'inchiostro', size: [3, 3], min: [1, 1], fit: 'contain', fixed: true },
    { type: 'quote', label: 'Pensiero', icon: 'ph-quotes', Component: DailyQuote, tone: 'sabbia', size: [3, 2], min: [2, 2], fit: 'contain', fixed: true },
    { type: 'water', label: 'Acqua', icon: 'ph-drop', Component: WaterGlasses, tone: 'cielo', size: [3, 2], min: [2, 2], fit: 'contain', fixed: true },
];

export const widgetByType = (t) => WIDGETS.find((w) => w.type === t);
