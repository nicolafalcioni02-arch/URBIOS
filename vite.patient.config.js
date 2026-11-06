import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// App paziente: build SEPARATA dal programma del medico, file multipli (serve per una CSP senza 'unsafe-inline').
// Uscita: dist-patient/ (da pubblicare su GitHub Pages). base './' = funziona in qualsiasi sottocartella.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    // In sviluppo Vite inietta uno script inline (React Refresh): la CSP stretta lo bloccherebbe. Si toglie SOLO in `dev`.
    { name: 'patient-csp-dev', transformIndexHtml: (html, ctx) => (ctx.server ? html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, '') : html) },
  ],
  build: {
    outDir: 'dist-patient',
    emptyOutDir: true,
    target: 'es2022',
    rollupOptions: { input: 'patient.html' },
    minify: 'esbuild',
  },
});
