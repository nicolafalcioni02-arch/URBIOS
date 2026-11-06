import test from 'node:test';
import assert from 'node:assert/strict';
import { createDiary, scrub } from '../diary.js';
import { buildHelpPrompt, buildUpdate } from '../prompt.js';

test('diario: tipi chiusi, URL ridotti a schema+host, codici lunghi oscurati, tetto di righe', () => {
    const d = createDiary({ now: () => 1 });
    d.record('boh', 'x'); assert.equal(d.all().length, 0);
    d.record('errore', 'fallito su wss://broker.example.org:8084/mqtt?token=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123 poi p1.AAAAAAAAAAAAAAAAAAAAAA');
    const t = d.all()[0].d;
    assert.ok(t.includes('wss://broker.example.org') && !t.includes('/mqtt') && !t.includes('token') && !t.includes('p1.AAAA'));
    assert.equal(scrub('x'.repeat(500)).length <= 140, true);
    for (let i = 0; i < 200; i++) d.record('stato', String(i));
    assert.equal(d.all().length, 80);
    assert.equal(d.since(d.last() - 3).length, 3);
});

test('prompt: contiene regole, percorso, stato e diario; nessun dato che non gli è stato dato', () => {
    const snapshot = { modo: 'online', stato: 'error', errore: 'aead: autenticazione fallita', codice: 'KEY_MISMATCH', archivioCifrato: true, trasporto: 'broker MQTT (broker.emqx.io)', informativa: true, pazienteCollegato: false, inUscita: 2, falliti: 1, documenti: [{ tipo: 'dieta', stato: 'in attesa' }] };
    const p = buildHelpPrompt({ snapshot, entries: [{ n: 1, t: 0, type: 'attivazione', d: 'ok' }], now: 0 });
    for (const s of ['REGOLE PER TE', 'UN passo alla volta', 'Non chiedere MAI', 'aead', 'KEY_MISMATCH', 'dieta → in attesa', 'attivazione: ok', 'Azzera i dati di connessione']) assert.ok(p.includes(s), s);
    assert.ok(!/\bMario\b|\bRossi\b|password:/i.test(p));
    const u = buildUpdate({ snapshot, entries: [], now: 0 });
    assert.ok(u.includes('AGGIORNAMENTO') && u.includes('(nessuna azione registrata)'));
});
