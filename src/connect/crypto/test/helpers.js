export const hex = (s) => Uint8Array.from(s.replace(/\s+/g, '').match(/../g) || [], (h) => parseInt(h, 16));
export const toHex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
