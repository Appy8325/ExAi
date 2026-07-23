export function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL ||
    (typeof window !== "undefined"
      ? (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
        ? "http://127.0.0.1:3001"
        : window.location.origin)
      : vercelOrigin());
  if (!url) throw new Error("Missing NEXT_PUBLIC_API_BASE_URL outside Vercel.");
  return url.replace(/\/$/, "");
}

function vercelOrigin() {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return host ? `https://${host}` : undefined;
}
