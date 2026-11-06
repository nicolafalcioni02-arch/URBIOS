// Unica fonte di casualità di connect/: CSPRNG del sistema. Mai Math.random.
export const randomBytes = (n) => {
    if (!Number.isInteger(n) || n < 0 || n > 65536) throw new RangeError('randomBytes: lunghezza non valida');
    return crypto.getRandomValues(new Uint8Array(n));
};
