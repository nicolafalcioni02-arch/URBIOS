// Nomi leggibili delle variabili. Si ricavano dai cataloghi già presenti nell'app (esami, misure, stile di vita);
// qui si aggiungono solo quelli che mancano. Una chiave senza nome viene "umanizzata" (pl_extra → "Pl extra").
import { DEFAULT_RANGE_EMATO } from '../../logic/db_defaults';
import { MEASURE_GROUPS, LIFESTYLE } from '../../components/patient/history/modals/visitDetailLogic';

const fromApp = {};
Object.entries(DEFAULT_RANGE_EMATO).forEach(([k, v]) => (fromApp[k] = v.unit ? `${v.label} (${v.unit})` : v.label));
MEASURE_GROUPS.forEach((g) => g.items.forEach(([k, l]) => (fromApp[k] = `${g.title}: ${l} (${g.unit})`)));
LIFESTYLE.forEach(([k, l, u]) => (fromApp[k] = u ? `${l} (${u})` : l));

export const VAR_LABELS = {
    ...fromApp,
    sesso: 'Sesso',
    fascia_eta: 'Fascia d’età',
    anno_nascita: 'Anno di nascita',
    eta_alla_visita: 'Età alla visita (anni)',
    giorni_da_prima_visita: 'Giorni dalla prima visita',
    peso: 'Peso (kg)',
    altezza: 'Altezza (cm)',
    bmi_calcolato: 'BMI (kg/m²)',
    stato_dieta: 'Stato della dieta',
    status: 'Stato del paziente',
    n_visite: 'Numero di visite',
    pa_max: 'Pressione massima (mmHg)',
    pa_min: 'Pressione minima (mmHg)',
    hr: 'Frequenza cardiaca (bpm)',
    spo2: 'SpO₂ (%)',
};
