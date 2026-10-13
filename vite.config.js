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
    minify: 'terser', // Ottimizzazione massima
    terserOptions: {
      compress: {
        // IMPORTANTE: Questo protegge le tue formule personalizzate
        // Impedisce al computer di cambiare nome alle variabili 'peso', 'altezza' ecc.
        keep_fnames: true, 
      },
      mangle: {
        keep_fnames: true, // Protezione doppia per le tue formule matematiche
      }
    }
  }
});