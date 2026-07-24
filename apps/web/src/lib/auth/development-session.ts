const cookieName = "exai-development-session";
const email = "apoorv@sessionguide.live";
const password = "Apoorv@8325";
const sessionLifetimeMs = 8 * 60 * 60 * 1000;

type DevelopmentSession = { email: string; expiresAt: number };

export function hasValidDevelopmentCredentials(candidateEmail: string, candidatePassword: string) {
  return candidateEmail === email && candidatePassword === password;
}

export async function createDevelopmentSession() {
  const payload = JSON.stringify({ email, expiresAt: Date.now() + sessionLifetimeMs });
  return `${toBase64Url(payload)}.${await sign(payload)}`;
}

export async function hasValidDevelopmentSession(value: string | undefined) {
  if (!value) return false;
  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) return false;

  const payload = fromBase64Url(encodedPayload);
  if (!payload || !(await signaturesMatch(signature, await sign(payload)))) return false;

  try {
    const session = JSON.parse(payload) as DevelopmentSession;
    return session.email === email && Number.isFinite(session.expiresAt) && session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export const developmentSessionCookie = {
  name: cookieName,
  options: { httpOnly: true, maxAge: sessionLifetimeMs / 1000, path: "/", sameSite: "lax" as const, secure: process.env.NODE_ENV === "production" },
};

async function sign(payload: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))));
}

async function signaturesMatch(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

function toBase64Url(value: string | Uint8Array) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  try {
    const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - (value.length % 4)) % 4);
    return new TextDecoder().decode(Uint8Array.from(atob(padded), (character) => character.charCodeAt(0)));
  } catch {
    return null;
  }
}
