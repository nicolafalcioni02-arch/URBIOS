import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

// App paziente: build SEPARATA dal programma del medico, file multipli (serve per una CSP senza 'unsafe-inline').
// Uscita: dist-patient/ (da pubblicare su GitHub Pages). base './' = funziona in qualsiasi sottocartella.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    // In sviluppo Vite inietta uno script inline (React Refresh): la CSP stretta lo bloccherebbe. Si toglie SOLO in `dev`.
    { name: 'patient-csp-dev', transformIndexHtml: (html, ctx) => (ctx.server ? html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, '') : html) },
    // Scrive sw.js nella cartella di uscita con versione (hash dei file) ed elenco dei file da tenere in cache.
    (() => {
      let out = '';
      const walk = (d, base = '') => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name), base + e.name + '/') : [base + e.name]));
      return {
        name: 'patient-sw', apply: 'build',
        configResolved: (c) => { out = resolve(c.root, c.build.outDir); },
        closeBundle() {
          const files = walk(out).filter((f) => f !== 'sw.js').sort();
          const h = createHash('sha256');
          for (const f of files) h.update(f).update(readFileSync(join(out, f)));
          const sw = readFileSync(resolve('src/patient/sw.js'), 'utf8').replace('__VERSION__', h.digest('hex').slice(0, 12)).replace("'__FILES__'", JSON.stringify(files.map((f) => './' + f)));
          writeFileSync(join(out, 'sw.js'), sw);
        },
      };
    })(),
  ],
  build: {
    outDir: 'dist-patient',
    emptyOutDir: true,
    target: 'es2022',
    rollupOptions: { input: ['patient.html', 'demo.html'] },
    minify: 'esbuild',
  },
});
