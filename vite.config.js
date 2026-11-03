import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile({ removeViteModuleLoader: true }) // Crea il file unico
  ],
  build: {
    target: 'esnext',
    assetsInlineLimit: 100000000, // Forza l'inclusione di immagini e font direttamente nell'HTML
    cssCodeSplit: false, // Evita di separare il file CSS dal resto
    rollupOptions: {
      output: {
        inlineDynamicImports: true, // IMPORTANTE: Impedisce a React di spezzettare il codice JS in più file
      },
    },
    minify: 'esbuild', // Terser esauriva la memoria; esbuild è molto più leggero
  },
  esbuild: {
    keepNames: true, // Mantiene i nomi di funzioni e variabili delle formule
  },
});
