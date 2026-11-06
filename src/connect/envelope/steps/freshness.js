// Passo 7: finestra di accettazione + deriva dell'orologio verso il futuro (SEC-54).
export const checkFresh = (ts, now, { freshnessWindowMs, clockSkewFutureMs }) => {
    if (ts > now + clockSkewFutureMs) throw new Error('stale');
    if (ts < now - freshnessWindowMs) throw new Error('stale');
};
