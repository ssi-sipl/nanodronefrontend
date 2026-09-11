import bcrypt from "bcryptjs";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set.");
  }
  return secret;
}

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (const b of arr) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input: string): Uint8Array {
  const padded = input
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(input.length + ((4 - (input.length % 4)) % 4), "=");
  const str = atob(padded);
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
  return arr;
}

async function getHmacKey() {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

type SessionPayload = {
  sub: string;   // user id
  email: string;
  exp: number;   // unix seconds
};

/** Creates a signed, tamper-proof session token (payload + HMAC signature, no external JWT lib). */
export async function createSessionToken(payload: Omit<SessionPayload, "exp">): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const full: SessionPayload = { ...payload, exp };

  const enc = new TextEncoder();
  const payloadB64 = base64UrlEncode(enc.encode(JSON.stringify(full)));
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64));

  return `${payloadB64}.${base64UrlEncode(sig)}`;
}

/** Verifies a session token's signature and expiry. Returns the payload if valid, null otherwise. */
export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;

  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;

  try {
    const key = await getHmacKey();
    const enc = new TextEncoder();
    const expectedSig = await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64));
    const expectedSigB64 = base64UrlEncode(expectedSig);

    if (expectedSigB64 !== sigB64) return null;

    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload: SessionPayload = JSON.parse(payloadJson);

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}