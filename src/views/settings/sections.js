// Registro delle Impostazioni: l'unico posto dove si aggiungono/spostano/rinominano le sezioni.
// Ogni scheda riceve sempre le stesse props: { db, onUpdateDb, onClose }.
// icon = nome in ui/icons.jsx
import { ProfileTab } from './tabs/profile/ProfileTab';
import { BillingTab } from './tabs/profile/BillingTab';
import { DocumentsTab } from './tabs/profile/DocumentsTab';
import { ScheduleTab } from './tabs/profile/ScheduleTab';
import { LookTab } from './tabs/look/LookTab';
import { FormulasTab } from './tabs/formulas/FormulasTab';
import { DataExchangeTab } from './tabs/dataExchange/DataExchangeTab';
import { SecurityTab } from './tabs/security/SecurityTab';
import { ConnectTab } from './tabs/connect/ConnectTab';
import { CiteTab } from './tabs/about/CiteTab';
import { InfoTab } from './tabs/about/InfoTab';

export const GROUPS = [
    {
        label: 'Studio',
        items: [
            { id: 'profilo', label: 'Profilo', sub: 'Dati personali e professionali', icon: 'user', Component: ProfileTab },
            { id: 'fatturazione', label: 'Fatturazione', sub: 'Dati fiscali e assicurazione', icon: 'receipt', Component: BillingTab },
            { id: 'documenti', label: 'Documenti e privacy', sub: 'Report, lettera di incarico, GDPR', icon: 'document', Component: DocumentsTab },
            { id: 'agenda', label: 'Orari e visite', sub: 'Disponibilità e durate', icon: 'clock', Component: ScheduleTab },
        ],
    },
    {
        label: 'App',
        items: [
            { id: 'aspetto', label: 'Aspetto', sub: 'Classico o Vetro', icon: 'palette', Component: LookTab },
            { id: 'formule', label: 'Formule', sub: 'Equazioni per i calcoli', icon: 'function', Component: FormulasTab },
        ],
    },
    {
        label: 'Dati',
        items: [
            { id: 'dati', label: 'Importa ed esporta', sub: 'CSV, documenti, anonimo', icon: 'exchange', Component: DataExchangeTab },
            { id: 'sicurezza', label: 'Sicurezza e archivio', sub: 'Salvataggio e cifratura', icon: 'shield', Component: SecurityTab },
            { id: 'connettivita', label: 'Connettività', sub: 'App paziente e dispositivi', icon: 'link', Component: ConnectTab },
        ],
    },
    {
        label: 'URBIOS',
        items: [
            { id: 'cita', label: 'Come citarci', sub: 'Per tesi e pubblicazioni', icon: 'quote', Component: CiteTab },
            { id: 'info', label: 'Info', sub: 'Versione, team e manifesto', icon: 'info', Component: InfoTab },
        ],
    },
];

export const SECTIONS = GROUPS.flatMap((g) => g.items);
export const sectionById = (id) => SECTIONS.find((s) => s.id === id);
