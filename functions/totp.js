// ═══════════════════════════════════════════════════════════════════════════════
// TOTP (RFC 6238) verification for Cloud Functions — Node port of src/core/totp.js.
// Must stay algorithm-compatible with the browser helper (base32 secret, HMAC-SHA1,
// 30s step, 6 digits, ±1 window) so a secret enrolled in the browser verifies here.
// ═══════════════════════════════════════════════════════════════════════════════

import { createHmac } from 'node:crypto';

const B32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/** Decode an RFC 4648 base32 string → Buffer. Tolerates spaces / padding / case. */
export function base32Decode(str) {
  const clean = String(str).toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const out = [];
  for (let i = 0; i < clean.length; i++) {
    const idx = B32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) {
      throw new Error('Karakter base32 tidak valid: ' + clean[i]);
    }
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function counterBytes(counter) {
  const buf = Buffer.alloc(8);
  let hi = Math.floor(counter / 0x100000000);
  let lo = counter >>> 0;
  for (let i = 7; i >= 4; i--) {
    buf[i] = lo & 0xff;
    lo = Math.floor(lo / 256);
  }
  for (let i = 3; i >= 0; i--) {
    buf[i] = hi & 0xff;
    hi = Math.floor(hi / 256);
  }
  return buf;
}

/** RFC 4226 HOTP value as a zero-padded string of `digits` length. */
export function hotp(secretBytes, counter, digits = 6) {
  const h = createHmac('sha1', secretBytes).update(counterBytes(counter)).digest();
  const offset = h[h.length - 1] & 0x0f;
  const bin =
    ((h[offset] & 0x7f) << 24) |
    ((h[offset + 1] & 0xff) << 16) |
    ((h[offset + 2] & 0xff) << 8) |
    (h[offset + 3] & 0xff);
  return String(bin % 10 ** digits).padStart(digits, '0');
}

/**
 * Verify a user-entered `token` against a base32 `secret`, allowing ±`window`
 * time steps for clock drift.
 */
export function verifyTOTP(
  secret,
  token,
  { time = Date.now(), step = 30, digits = 6, window = 1 } = {}
) {
  const clean = String(token || '').replace(/\s+/g, '');
  if (!/^\d+$/.test(clean) || clean.length !== digits) {
    return false;
  }
  let secretBytes;
  try {
    secretBytes = base32Decode(secret);
  } catch (_) {
    return false;
  }
  const counter = Math.floor(time / 1000 / step);
  for (let w = -window; w <= window; w++) {
    if (hotp(secretBytes, counter + w, digits) === clean) {
      return true;
    }
  }
  return false;
}
