// Utilità sui byte. `equal` è a tempo costante (usare SEMPRE questa per confrontare segreti/MAC).
export const utf8 = (s) => new TextEncoder().encode(s);

export const concat = (...parts) => {
    const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
    let o = 0;
    for (const p of parts) { out.set(p, o); o += p.length; }
    return out;
};

export const equal = (a, b) => {
    if (a.length !== b.length) return false;
    let d = 0;
    for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
    return d === 0;
};

export const u32be = (n) => new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);

// Base64url: SOLO rappresentazione, non è una misura di sicurezza.
export const b64u = {
    enc: (b) => { let s = ''; for (const x of b) s += String.fromCharCode(x); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
    dec: (str) => {
        if (!/^[A-Za-z0-9_-]*$/.test(str)) throw new Error('base64url non valido');
        const s = str.replace(/-/g, '+').replace(/_/g, '/');
        return Uint8Array.from(atob(s + '='.repeat((4 - (s.length % 4)) % 4)), (c) => c.charCodeAt(0));
    },
};
