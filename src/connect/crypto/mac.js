// HMAC-SHA256 (usato per i topic opachi, SEC-83). Confronti: usare bytes.equal.
import { hmac } from '@noble/hashes/hmac.js';
import { sha256 } from '@noble/hashes/sha2.js';
export const hmacSha256 = (key, data) => hmac(sha256, key, data);
