// Vettori ufficiali (RFC / NIST) per le primitive: se falliscono, la libreria non fa ciò che dichiara.
import test from 'node:test';
import assert from 'node:assert/strict';
import { x25519, ed25519 } from '@noble/curves/ed25519.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { hex, toHex } from './helpers.js';

test('HKDF-SHA256 — RFC 5869 caso 1', () => {
    const okm = hkdf(sha256, hex('0b'.repeat(22)), hex('000102030405060708090a0b0c'), hex('f0f1f2f3f4f5f6f7f8f9'), 42);
    assert.equal(toHex(okm), '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865');
});

test('X25519 — RFC 7748 §6.1', () => {
    const a = hex('77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a');
    const bPub = hex('de9edb7d7b7dc1b4d35b61c2ece435373f8343c85b78674dadfc7e146f882b4f');
    assert.equal(toHex(x25519.getSharedSecret(a, bPub)), '4a5d9d5ba4ce2de1728e3bf480350f25e07e21c947d19e3376f09b3c1e161742');
});

test('Ed25519 — RFC 8032 test 1 (messaggio vuoto)', () => {
    const sk = hex('9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60');
    assert.equal(toHex(ed25519.getPublicKey(sk)), 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a');
    const sig = ed25519.sign(new Uint8Array(0), sk);
    assert.equal(toHex(sig), 'e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b');
});

test('AES-256-GCM — vettore NIST (chiave 0, iv 0, testo 0)', async () => {
    const key = await crypto.subtle.importKey('raw', new Uint8Array(32), 'AES-GCM', false, ['encrypt']);
    const out = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: new Uint8Array(12), tagLength: 128 }, key, new Uint8Array(16)));
    assert.equal(toHex(out), 'cea7403d4d606b6e074ec5d3baf39d18' + 'd0d1c8a799996bf0265b98b5d48ab919');
});
