// Elenco dei widget disponibili. Per aggiungerne uno: crea il componente in widgets/ e aggiungi una riga qui.
// size = [larghezza, altezza] in celle di partenza, min = minimo consentito, fit = 'contain' (si rimpicciolisce per starci tutto)
// oppure 'fixed: true' = dimensioni bloccate (niente maniglie: la grafica e' pensata per quella misura), oppure 'width' (si adatta in larghezza e scorre in altezza). tone = tono di partenza. Ogni widget riceve { id, data, setData, db, tone }.
import { ClockRoman } from './widgets/ClockRoman';
import { ClockDigital } from './widgets/ClockDigital';
import { PostIt } from './widgets/PostIt';
import { TodoNotebook } from './widgets/TodoNotebook';
import { MonthCalendar } from './widgets/MonthCalendar';
import { Timer } from './widgets/Timer';
import { MoonPhase } from './widgets/MoonPhase';
import { DailyQuote } from './widgets/DailyQuote';
import { WaterGlasses } from './widgets/WaterGlasses';
import { Agenda } from './widgets/Agenda';
import { Birthdays } from './widgets/Birthdays';
import { LabRunning } from './widgets/LabRunning';
import { LabStock } from './widgets/LabStock';

export const WIDGETS = [
    { type: 'clock', label: 'Orologio', icon: 'ph-clock', Component: ClockRoman, tone: 'carta', size: [3, 3], min: [1, 1], fit: 'contain', fixed: true },
    { type: 'labrunning', onlyLab: true, label: 'In corso', icon: 'ph-flask', Component: LabRunning, tone: 'carta', size: [4, 3], min: [3, 2], fit: 'width', labSize: [4, 2], labMin: [3, 2], labFit: 'fill' },
    { type: 'labstock', onlyLab: true, label: 'Magazzino', icon: 'ph-package', Component: LabStock, tone: 'sabbia', size: [4, 3], min: [3, 2], fit: 'width', labSize: [4, 2], labMin: [3, 2], labFit: 'fill' },
    { type: 'dclock', label: 'Orologio digitale', icon: 'ph-clock-countdown', Component: ClockDigital, tone: 'inchiostro', size: [3, 2], min: [2, 1], fit: 'contain' },
    { type: 'agenda', noLab: true, label: 'Appuntamenti', icon: 'ph-calendar-check', Component: Agenda, tone: 'carta', size: [4, 4], min: [2, 3], fit: 'contain' },
    { type: 'birthdays', noLab: true, label: 'Compleanni', icon: 'ph-cake', Component: Birthdays, tone: 'salvia', size: [3, 2], min: [2, 2], fit: 'width' },
    { type: 'postit', label: 'Foglietto', icon: 'ph-note', Component: PostIt, tone: 'sabbia', size: [3, 3], min: [2, 2], fit: 'fill', labSize: [3, 2], labMin: [2, 2] },
    { type: 'todo', label: 'Da fare', icon: 'ph-list-checks', Component: TodoNotebook, tone: 'carta', size: [4, 3], min: [2, 2], fit: 'width', labSize: [3, 2], labMin: [2, 2], labFit: 'fill' },
    { type: 'calendar', label: 'Calendario', icon: 'ph-calendar-blank', Component: MonthCalendar, tone: 'carta', size: [3, 3], min: [3, 3], fit: 'contain', fixed: true, labSize: [4, 2], labMin: [3, 2], labFit: 'fill' },
    { type: 'timer', label: 'Timer', icon: 'ph-timer', Component: Timer, tone: 'inchiostro', size: [3, 3], min: [2, 2], fit: 'contain', fixed: true, labSize: [4, 2], labMin: [3, 2], labFit: 'fill' },
    { type: 'moon', label: 'Luna', icon: 'ph-moon-stars', Component: MoonPhase, tone: 'inchiostro', size: [3, 3], min: [1, 1], fit: 'contain', fixed: true, labSize: [4, 2], labMin: [2, 2], labFit: 'fill' },
    { type: 'quote', label: 'Pensiero', icon: 'ph-quotes', Component: DailyQuote, tone: 'sabbia', size: [3, 2], min: [2, 2], fit: 'contain', fixed: true, labSize: [4, 2], labMin: [3, 2], labFit: 'fill' },
    { type: 'water', label: 'Acqua', icon: 'ph-drop', Component: WaterGlasses, tone: 'cielo', size: [3, 2], min: [2, 2], fit: 'contain', fixed: true, labSize: [4, 2], labMin: [3, 2], labFit: 'fill' },
];

// il laboratorio non ha pazienti: niente appuntamenti né compleanni
export const widgetsFor = (mode) => (mode === 'lab' ? WIDGETS.filter((w) => !w.noLab) : WIDGETS.filter((w) => !w.onlyLab));
// misure e comportamento nel Laboratorio (fascia bassa e larga): labSize/labMin/labFit, altrimenti quelli di sempre
export const sizeIn = (d, lab) => (lab && d.labSize) || d.size;
export const minIn = (d, lab) => (lab && d.labMin) || d.min;
export const fitIn = (d, lab) => (lab && d.labFit) || d.fit;
export const fixedIn = (d, lab) => !!d.fixed && !(lab && d.labSize);
export const widgetByType = (t) => WIDGETS.find((w) => w.type === t);
