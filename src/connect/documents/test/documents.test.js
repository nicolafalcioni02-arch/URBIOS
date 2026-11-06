import test from 'node:test';
import assert from 'node:assert/strict';
import { dietToDocument } from '../dietDoc.js';
import { trainingToDocument } from '../trainingDoc.js';
import { buildPut, forbiddenTermsOf } from '../outgoing.js';
import { encodeMessage } from '../../sync/message.js';

const MAX = 1024 * 1024;
const days = [{ id: 'x', title: 'Giorno 1', meals: [{ id: 'm', title: 'Colazione', items: [{ id: 'i', name: 'Avena', weight: 40.5, kcal: 372, p: 13, c: 60, f: 7 }, { id: 'j', name: '', weight: 10 }] }, { id: 'v', title: 'Vuoto', items: [] }] }];
const sets = (a) => ({ serie: `${a.length} × 8`, load: '60', pct: '', rpe: '8', tempo: '', rec: '90"', notes: [] });

test('dieta: solo voci utili, numeri interi, nessun dato clinico', () => {
    const d = dietToDocument({ days, targets: { isConfigured: true, kcal: 1800.4, p: 100, c: 200, f: 60 }, calcData: { weight: 80, sex: 'M' } });
    assert.equal(d.body.giorni[0].pasti.length, 1);
    assert.deepEqual(d.body.giorni[0].pasti[0].voci, [{ n: 'Avena', g: 41, kcal: 151 }]);
    assert.equal(d.body.obiettivo.kcal, 1800);
    assert.ok(!JSON.stringify(d).includes('weight'));
    assert.doesNotThrow(() => encodeMessage(buildPut({ doc: d, forbidden: [], maxBytes: MAX }).msg, MAX));
    assert.throws(() => dietToDocument({ days: [], targets: null }));
});

test('scheda: niente cliente/obiettivo; esercizi vuoti scartati', () => {
    const scheda = { titolo: 'Forza A', cliente: 'Mario Rossi', obiettivo: 'dimagrire', weeks: [{ title: '', kind: 'deload', days: [{ title: '', exercises: [{ name: 'Squat', sets: [{}, {}, {}], note: 'ok' }, { name: ' ', sets: [] }] }] }] };
    const d = trainingToDocument({ scheda, summarizeSets: sets });
    const s = JSON.stringify(d);
    assert.ok(!s.includes('Mario') && !s.includes('dimagrire'));
    assert.equal(d.body.settimane[0].scarico, true);
    assert.equal(d.body.settimane[0].giorni[0].esercizi.length, 1);
    assert.equal(d.body.settimane[0].giorni[0].esercizi[0].serie, '3 × 8');
    assert.equal(d.title, 'Forza A');
    assert.throws(() => trainingToDocument({ scheda: { weeks: [] }, summarizeSets: sets }));
});

test('invio: revisioni crescenti con lo stesso docId; il nome del paziente blocca', () => {
    const doc = dietToDocument({ days, targets: null });
    const a = buildPut({ doc, link: null, maxBytes: MAX });
    const b = buildPut({ doc, link: a.link, maxBytes: MAX });
    assert.equal(a.msg.rev, 1); assert.equal(b.msg.rev, 2); assert.equal(b.msg.parentRev, 1);
    assert.equal(a.msg.docId, b.msg.docId); assert.notEqual(a.msg.ref, b.msg.ref);
    const forbidden = forbiddenTermsOf({ nome: 'Mario', cognome: 'Rossi' });
    const bad = dietToDocument({ days: [{ title: 'Dieta Rossi', meals: [{ title: 'Pranzo', items: [{ name: 'Pasta', weight: 80, kcal: 350 }] }] }], targets: null });
    assert.throws(() => buildPut({ doc: bad, forbidden, maxBytes: MAX }), (e) => e.code === 'IDENTIFIERS');
    assert.throws(() => buildPut({ doc, maxBytes: 20 }));
});
