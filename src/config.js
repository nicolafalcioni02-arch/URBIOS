// Configurazione di build.
// "Entra (Demo)" (apertura senza file) esiste solo in sviluppo (`npm run dev`) o con `npm run build:demo`.
// Nella versione ufficiale (`npm run build`) sparisce: si entra solo caricando un archivio o creandone uno nuovo.
export const ALLOW_DEMO_ENTRY = import.meta.env.DEV || import.meta.env.VITE_ALLOW_DEMO === '1';
export const APP_VERSION = '1.0.0';
