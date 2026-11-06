// Elenco CHIUSO dei tipi di evento (SEC-91). Un tipo non in elenco viene rifiutato.
export const EVENT_TYPES = Object.freeze([
    'auth.unlock', 'auth.fail', 'auth.lock',
    'device.pair', 'device.enroll', 'device.revoke',
    'mode.change', 'sync.send', 'sync.receive', 'sync.reject',
    'data.access', 'data.export', 'backup.create', 'backup.restore',
    'perm.change', 'data.delete', 'conflict.detected', 'conflict.resolved', 'config.change',
]);
